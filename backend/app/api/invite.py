# Import External Libraries
# ---
from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.database import get_db
from app.services import invite_service
from app.security import get_current_user
from app.models.user import User
from app.schemas import invite
# ---

# Setup API Router
# ---
router = APIRouter(
    prefix="/invite",
    tags=["Invites"],
)
# ---

# Get User Invites
# ---
@router.get("/")
def get_user_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return invite_service.get_current_user_invites(
        db=db,
        current_user=current_user
	)
# ---

# Get Pending Invites
# ---
@router.get("/pending")
def get_user_pending_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return group_service.get_pending_invites(
        db=db,
        current_user=current_user,
    )
# ---

# Accept Invite
# ---
@router.post("/accept")
def accept_invite(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return invite_service.accept_invite(
        db=db,
        current_user=current_user,
        group_id=group_id,
    )
# ---

# Invite User
# ---
@router.post("/{group_id}")
def invite_user(
    group_id: int,
    username: str,
    role: invite.InviteRole,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return group_service.create_invite(
        db=db,
        current_user=current_user,
        group_id=group_id,
        username=username,
        role=role
    )
# ---