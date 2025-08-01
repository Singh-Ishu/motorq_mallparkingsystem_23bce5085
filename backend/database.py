from sqlmodel import create_engine, Session, SQLModel, select
from .models import Vehicle, ParkingSlot, ParkingSession, SlotType, SlotStatus

# SQLite database URL
DATABASE_URL = "sqlite:///./parking.db"

# Create the engine
engine = create_engine(DATABASE_URL, echo=True) # echo=True for logging SQL queries

def create_db_and_tables():
    """Creates all database tables defined in SQLModel metadata."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency to get a database session."""
    with Session(engine) as session:
        yield session
def populate_default_slots():
    """
    Populates the database with default parking slots if they don't already exist.
    Assumes a square grid layout for demonstration.
    """
    with Session(engine) as session:
        print("Checking for and populating default parking slots...")
        rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        slots_per_row = 12

        for row_char in rows:
            for i in range(1, slots_per_row + 1):
                slot_number = f"{row_char}{i}"

                # Determine slot type based on row character
                slot_type: SlotType
                has_charger: bool = False

                if row_char in ['A', 'B', 'C', 'D', 'E']:
                    slot_type = SlotType.REGULAR
                elif row_char == 'F':
                    slot_type = SlotType.EV
                    has_charger = True
                elif row_char == 'G':
                    slot_type = SlotType.HANDICAP
                elif row_char == 'H':
                    slot_type = SlotType.BIKE
                else:
                    slot_type = SlotType.REGULAR # Fallback

                # Check if slot already exists
                existing_slot = session.exec(
                    select(ParkingSlot).where(ParkingSlot.slot_number == slot_number)
                ).first()

                if not existing_slot:
                    new_slot = ParkingSlot(
                        slot_number=slot_number,
                        slot_type=slot_type,
                        has_charger=has_charger,
                        status=SlotStatus.AVAILABLE
                    )
                    session.add(new_slot)
                    print(f"Added default slot: {slot_number} ({slot_type.value})")

        session.commit()
        print("Default slot population complete.")
