from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models import ParkingSlot, SlotStatus, ParkingSession, SessionStatus
from ..schemas import SlotStatusUpdateRequest, ParkingSlotResponse, SlotCreateRequest

router = APIRouter(prefix="/slots", tags=["Parking Slots"])

@router.post("/",response_model=ParkingSlotResponse, status_code=status.HTTP_201_CREATED)
async def create_parking_slot(
    request: SlotCreateRequest,
    db: Session = Depends(get_session)
):
    """
    Creates a new parking slot.
    """
    # Check if a slot with the same slot_number already exists
    existing_slot = db.exec(
        select(ParkingSlot).where(ParkingSlot.slot_number == request.slot_number)
    ).first()

    if existing_slot:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Parking slot with number '{request.slot_number}' already exists."
        )

    new_slot = ParkingSlot(
        slot_number=request.slot_number,
        slot_type=request.slot_type,
        has_charger=request.has_charger,
        status=SlotStatus.AVAILABLE # New slots are always available by default
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

@router.put("/{slot_id}/status", response_model=ParkingSlotResponse)
async def update_slot_status(
    slot_id: int,
    request: SlotStatusUpdateRequest,
    db: Session = Depends(get_session)
):
    """
    Updates the status of a parking slot (e.g., to Maintenance or Available).
    Prevents setting an occupied slot to available if an active session exists.
    """
    slot = db.exec(select(ParkingSlot).where(ParkingSlot.id == slot_id)).first()

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking slot with ID {slot_id} not found."
        )

    if request.status == SlotStatus.AVAILABLE:
        # Check if there's an active session in this slot before making it available
        active_session = db.exec(
            select(ParkingSession).where(
                ParkingSession.slot_id == slot_id,
                ParkingSession.status == SessionStatus.ACTIVE
            )
        ).first()
        if active_session:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Slot {slot.slot_number} is currently occupied by an active session (ID: {active_session.id}). Cannot set to Available."
            )

    slot.status = request.status
    db.add(slot)
    db.commit()
    db.refresh(slot)

    return slot
