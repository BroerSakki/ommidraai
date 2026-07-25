# Imports
# ---
from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
from app.api.auth import router as auth_router
# ---

app = FastAPI()

app.include_router(auth_router)