from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .models import VehicleType, SlotType, SlotStatus, BillingType, SessionStatus

# --- Request Schemas ---


class VehicleEntryRequest(BaseModel):
    """Schema for vehicle entry request."""
    number_plate: str = Field(..., max_length=20)
    vehicle_type: VehicleType
    billing_type: BillingType
    slot_id: Optional[int] = None

class SlotCreateRequest(BaseModel): # <--- NEW
    """Schema for creating a new parking slot."""
    slot_number: str = Field(..., max_length=10)
    slot_type: SlotType
    has_charger: bool = False 

class SlotStatusUpdateRequest(BaseModel):
    """Schema for updating a parking slot's status."""
    status: SlotStatus

# --- Response Schemas ---

class ParkingSlotResponse(BaseModel):
    """Schema for returning parking slot details."""
    id: int
    slot_number: str
    slot_type: SlotType
    status: SlotStatus
    has_charger: bool

    class Config:
        from_attributes = True # Allows Pydantic to read from ORM models

class ParkingSessionResponse(BaseModel):
    """Schema for returning parking session details."""
    id: int
    vehicle_number_plate: str
    slot_id: int
    entry_time: datetime
    exit_time: Optional[datetime]
    status: SessionStatus
    billing_type: BillingType
    billing_amount: Optional[float]

    class Config:
        from_attributes = True

class VehicleEntryResponse(BaseModel):
    """Schema for response after successful vehicle entry."""
    message: str
    session: ParkingSessionResponse
    assigned_slot: ParkingSlotResponse

class VehicleExitResponse(BaseModel):
    """Schema for response after successful vehicle exit."""
    message: str
    session: ParkingSessionResponse


class DashboardSummaryResponse(BaseModel):
    """Schema for dashboard summary counts."""
    total_slots: int
    available_slots: int
    occupied_slots: int
    maintenance_slots: int