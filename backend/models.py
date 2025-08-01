from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from enum import Enum

# --- Enums ---
class VehicleType(str, Enum):
    """Defines the types of vehicles supported by the system."""
    CAR = "Car"
    BIKE = "Bike"
    EV = "EV"
    HANDICAP = "Handicap Accessible"

class SlotType(str, Enum):
    """Defines the types of parking slots."""
    REGULAR = "Regular"
    COMPACT = "Compact"
    EV = "EV"
    HANDICAP = "Handicap Accessible"
    BIKE = "Bike"

class SlotStatus(str, Enum):
    """Defines the status of a parking slot."""
    AVAILABLE = "Available"
    OCCUPIED = "Occupied"
    MAINTENANCE = "Maintenance"

class SessionStatus(str, Enum):
    """Defines the status of a parking session."""
    ACTIVE = "Active"
    COMPLETED = "Completed"

class BillingType(str, Enum):
    """Defines the billing type for a parking session."""
    HOURLY = "Hourly"
    DAY_PASS = "Day Pass"

# --- Models ---

class Vehicle(SQLModel, table=True):
    """Represents a vehicle in the parking system."""
    id: Optional[int] = Field(default=None, primary_key=True)
    number_plate: str = Field(unique=True, index=True, max_length=20)
    vehicle_type: VehicleType

class ParkingSlot(SQLModel, table=True):
    """Represents a parking slot in the mall."""
    id: Optional[int] = Field(default=None, primary_key=True)
    slot_number: str = Field(unique=True, index=True, max_length=10) # e.g., B1-12
    slot_type: SlotType
    status: SlotStatus = SlotStatus.AVAILABLE
    has_charger: bool = Field(default=False)

class ParkingSession(SQLModel, table=True):
    """Represents an active or completed parking session."""
    id: Optional[int] = Field(default=None, primary_key=True)
    vehicle_number_plate: str = Field(index=True, max_length=20) # Reference to Vehicle.number_plate
    slot_id: int = Field(index=True) # Reference to ParkingSlot.id
    entry_time: datetime = Field(default_factory=datetime.now)
    exit_time: Optional[datetime] = None
    status: SessionStatus = SessionStatus.ACTIVE
    billing_type: BillingType
    billing_amount: Optional[float] = None # Calculated on exit for Hourly, fixed on entry for Day Pass
