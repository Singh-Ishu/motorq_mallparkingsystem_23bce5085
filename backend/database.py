from sqlmodel import create_engine, Session, SQLModel
from .models import Vehicle, ParkingSlot, ParkingSession 

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