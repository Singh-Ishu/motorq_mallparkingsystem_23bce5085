# API endpoints for vehicle entry and exit

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import List, Optional

from ..database import get_session
from ..models import Vehicle, ParkingSlot, ParkingSession, VehicleType, SlotType, SlotStatus, BillingType, SessionStatus
from ..schemas import VehicleEntryRequest, VehicleEntryResponse, VehicleExitResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

# Define parking rates
HOURLY_RATE_FIRST_HOUR = 50.0  #50 INR for the first hour
HOURLY_RATE_SUBSEQUENT = 30.0  #30 INR for subsequent hours
DAY_PASS_RATE = 200.0          #200 INR for a day pass

@router.post("/entry", response_model=VehicleEntryResponse, status_code=status.HTTP_201_CREATED)
async def vehicle_entry(request: VehicleEntryRequest, db: Session = Depends(get_session)):
    """
    Handles vehicle entry, auto-assigns a slot, or allows manual override.
    Creates a new Vehicle record if the number plate is new.
    Creates an active ParkingSession.
    """
    # 1. Check for existing active session for the number plate
    existing_active_session = db.exec(
        select(ParkingSession).where(
            ParkingSession.vehicle_number_plate == request.number_plate,
            ParkingSession.status == SessionStatus.ACTIVE
        )
    ).first()

    if existing_active_session:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Vehicle with number plate '{request.number_plate}' already has an active session (Session ID: {existing_active_session.id})."
        )
    # 2. Find or create Vehicle record
    vehicle = db.exec(select(Vehicle).where(Vehicle.number_plate == request.number_plate)).first()
    if not vehicle:
        vehicle = Vehicle(number_plate=request.number_plate, vehicle_type=request.vehicle_type)
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)

    # 3. Determine slot assignment
    assigned_slot: Optional[ParkingSlot] = None

    if request.slot_id:
        # Manual override
        assigned_slot = db.exec(
            select(ParkingSlot).where(
                ParkingSlot.id == request.slot_id,
                ParkingSlot.status == SlotStatus.AVAILABLE
            )
        ).first()
        if not assigned_slot:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Manual slot ID {request.slot_id} is not available or does not exist."
            )
        # Validate slot type compatibility for manual override (optional but good practice)
        if not _is_slot_compatible(request.vehicle_type, assigned_slot.slot_type, assigned_slot.has_charger):
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Manual slot ID {request.slot_id} is not compatible with vehicle type {request.vehicle_type.value}."
            )
    else:
        # Auto-assignment
        compatible_slot_types = _get_compatible_slot_types(request.vehicle_type)
        
        # Prioritize specific slot types first
        for slot_type in compatible_slot_types:
            query = select(ParkingSlot).where(
                ParkingSlot.slot_type == slot_type,
                ParkingSlot.status == SlotStatus.AVAILABLE
            )
            # Special handling for EV slots with chargers
            if request.vehicle_type == VehicleType.EV:
                query = query.where(ParkingSlot.has_charger == True)

            assigned_slot = db.exec(query).first() # Simple first available
            if assigned_slot:
                break
        
        if not assigned_slot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No available slot found for vehicle type {request.vehicle_type.value}."
            )

    # 4. Create Parking Session
    new_session = ParkingSession(
        vehicle_number_plate=request.number_plate,
        slot_id=assigned_slot.id,
        billing_type=request.billing_type,
        status=SessionStatus.ACTIVE
    )

    # If Day Pass, set billing amount at entry
    if request.billing_type == BillingType.DAY_PASS:
        new_session.billing_amount = DAY_PASS_RATE

    db.add(new_session)

    # 5. Update Parking Slot status to Occupied
    assigned_slot.status = SlotStatus.OCCUPIED
    db.add(assigned_slot)

    db.commit()
    db.refresh(new_session)
    db.refresh(assigned_slot)

    return VehicleEntryResponse(
        message=f"Vehicle '{request.number_plate}' entered. Assigned to slot {assigned_slot.slot_number}.",
        session=new_session,
        assigned_slot=assigned_slot
    )

@router.put("/exit/{session_id}", response_model=VehicleExitResponse)
async def vehicle_exit_by_session_id(session_id: int, db: Session = Depends(get_session)):
    """
    Handles vehicle exit by session ID, calculates billing, and frees the slot.
    """
    session_to_exit = db.exec(
        select(ParkingSession).where(
            ParkingSession.id == session_id,
            ParkingSession.status == SessionStatus.ACTIVE
        )
    ).first()

    if not session_to_exit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active parking session with ID {session_id} not found."
        )

    # Set exit time
    session_to_exit.exit_time = datetime.now()

    # Calculate billing amount
    if session_to_exit.billing_type == BillingType.HOURLY:
        duration: timedelta = session_to_exit.exit_time - session_to_exit.entry_time
        total_minutes = duration.total_seconds() / 60
        total_hours = total_minutes / 60

        if total_hours <= 1:
            session_to_exit.billing_amount = HOURLY_RATE_FIRST_HOUR
        else:
            # Calculate for subsequent hours, rounding up to the next full hour
            # (e.g., 1.1 hours is 2 hours for billing purposes: 1st hour + 1 subsequent hour)
            billed_hours = int(total_hours)
            if total_minutes % 60 > 0: # If there's any fraction of an hour, count it as a full hour
                billed_hours += 1
            
            session_to_exit.billing_amount = HOURLY_RATE_FIRST_HOUR + (max(0, billed_hours - 1) * HOURLY_RATE_SUBSEQUENT)
            
    # For DAY_PASS, billing_amount was already set at entry

    session_to_exit.status = SessionStatus.COMPLETED
    db.add(session_to_exit)

    # Free up the parking slot
    parking_slot = db.exec(select(ParkingSlot).where(ParkingSlot.id == session_to_exit.slot_id)).first()
    if parking_slot:
        parking_slot.status = SlotStatus.AVAILABLE
        db.add(parking_slot)

    db.commit()
    db.refresh(session_to_exit)
    if parking_slot:
        db.refresh(parking_slot)

    return VehicleExitResponse(
        message=f"Vehicle '{session_to_exit.vehicle_number_plate}' exited. Total amount: {session_to_exit.billing_amount:.2f} INR.",
        session=session_to_exit
    )

# Helper functions for slot assignment
def _get_compatible_slot_types(vehicle_type: VehicleType) -> List[SlotType]:
    """Returns a prioritized list of compatible slot types for a given vehicle type."""
    if vehicle_type == VehicleType.CAR:
        return [SlotType.REGULAR, SlotType.COMPACT]
    elif vehicle_type == VehicleType.BIKE:
        return [SlotType.BIKE]
    elif vehicle_type == VehicleType.EV:
        return [SlotType.EV, SlotType.REGULAR, SlotType.COMPACT] # EV can use regular/compact if EV slot with charger isn't available
    elif vehicle_type == VehicleType.HANDICAP:
        return [SlotType.HANDICAP, SlotType.REGULAR, SlotType.COMPACT] # Handicap can use regular/compact if accessible isn't available
    return []

def _is_slot_compatible(vehicle_type: VehicleType, slot_type: SlotType, has_charger: bool) -> bool:
    """Checks if a given slot type is compatible with a vehicle type."""
    if vehicle_type == VehicleType.CAR:
        return slot_type in [SlotType.REGULAR, SlotType.COMPACT]
    elif vehicle_type == VehicleType.BIKE:
        return slot_type == SlotType.BIKE
    elif vehicle_type == VehicleType.EV:
        # EV requires EV slot with charger, or can use regular/compact without charger
        return (slot_type == SlotType.EV and has_charger) or \
               (slot_type in [SlotType.REGULAR, SlotType.COMPACT] and not has_charger)
    elif vehicle_type == VehicleType.HANDICAP:
        return slot_type in [SlotType.HANDICAP, SlotType.REGULAR, SlotType.COMPACT]
    return False