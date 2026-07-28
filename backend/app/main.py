# Imports
# ---
from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
# --

# Router Imports
# ---
from app.api.auth import router as auth_router
from app.api.dev.dev import router as dev_database
# ---

app = FastAPI()

# Root Call
# ---
@app.get("/", tags=["Root"])
def root():
    return {"message": "Backend is running"}
# ---

# Routing
# ---
app.include_router(auth_router)
app.include_router(dev_database)
# ---