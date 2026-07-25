# Imports
# ---
from fastapi import APIRouter
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
# ---

# Register
# ---
@router.post("/register")
def register():
    pass
# ---

# Login
# ---
@router.post("/login")
def login():
    pass
# ---

# Current User
# ---
@router.get("/me")
def me():
    pass
# ---