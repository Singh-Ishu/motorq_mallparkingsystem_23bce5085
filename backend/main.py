# Main FastAPI application entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import create_db_and_tables, engine
from .routers import vehicles, slots, dashboard 

# Define lifespan context for database initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager for application startup and shutdown events.
    Used to create database tables on startup.
    """
    print("Creating tables...")
    create_db_and_tables()
    print("Tables created!")
    yield
    print("Shutting down...")


app = FastAPI(
    title="Mall Parking Management System API",
    version="1.0.0",
    description="API for managing parking operations in a shopping mall.",
    lifespan=lifespan 
)

# Configure CORS to allow frontend to communicate with the backend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Including the routers
app.include_router(vehicles.router)
app.include_router(slots.router)
app.include_router(dashboard.router)

# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "MEOW MEOW MEOW"}