from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select # <--- Removed func
from typing import List, Optional

from ..database import get_session
from ..models import ParkingSlot, ParkingSession, SlotStatus, SlotType, SessionStatus
from ..schemas import DashboardSummaryResponse, ParkingSlotResponse, ParkingSessionResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(db: Session = Depends(get_session)):
    """
    Returns a summary of parking slot counts (total, available, occupied, maintenance).
    """
    # Corrected way to get counts from SQLModel/SQLAlchemy results
    total_slots = len(db.exec(select(ParkingSlot)).all())
    available_slots = len(db.exec(select(ParkingSlot).where(ParkingSlot.status == SlotStatus.AVAILABLE)).all())
    occupied_slots = len(db.exec(select(ParkingSlot).where(ParkingSlot.status == SlotStatus.OCCUPIED)).all())
    maintenance_slots = len(db.exec(select(ParkingSlot).where(ParkingSlot.status == SlotStatus.MAINTENANCE)).all())

    return DashboardSummaryResponse(
        total_slots=total_slots,
        available_slots=available_slots,
        occupied_slots=occupied_slots,
        maintenance_slots=maintenance_slots
    )

@router.get("/slots", response_model=List[ParkingSlotResponse])
async def get_all_slots(
    slot_type: Optional[SlotType] = Query(None, description="Filter by slot type"),
    status: Optional[SlotStatus] = Query(None, description="Filter by slot status"),
    db: Session = Depends(get_session)
):
    """
    Returns a list of all parking slots, with optional filters.
    """
    query = select(ParkingSlot)
    if slot_type:
        query = query.where(ParkingSlot.slot_type == slot_type)
    if status:
        query = query.where(ParkingSlot.status == status)

    slots = db.exec(query).all()
    return slots

@router.get("/sessions", response_model=List[ParkingSessionResponse])
async def get_all_sessions(
    status: Optional[SessionStatus] = Query(None, description="Filter by session status"),
    number_plate: Optional[str] = Query(None, description="Search by vehicle number plate"),
    db: Session = Depends(get_session)
):
    """
    Returns a list of parking sessions, with optional filters and search.
    """
    query = select(ParkingSession)
    if status:
        query = query.where(ParkingSession.status == status)
    if number_plate:
        # Case-insensitive search
        query = query.where(ParkingSession.vehicle_number_plate.ilike(f"%{number_plate}%"))

    sessions = db.exec(query).all()
    return sessions

