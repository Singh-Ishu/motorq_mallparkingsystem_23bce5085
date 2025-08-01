from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models import ParkingSlot, SlotStatus, ParkingSession, SessionStatus
from ..schemas import SlotStatusUpdateRequest, ParkingSlotResponse

router = APIRouter(prefix="/slots", tags=["Parking Slots"])

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
