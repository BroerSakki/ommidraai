# Base Imports
# ---
from fastapi import HTTPException
from typing import List
# ---

# Database Imports
# ---
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
# ---

# Import Models
# ---
from app.models.invite import Invite
# ---

# Import Schemas
# ---
from app.schemas.invite import InviteCreate
# ---

# Import Services
# ---
from app.services.database import groups_table
from app.services.database import user_groups_table
# ---

# Get Invitations
# ---
def get_invitations_by_origin(
    db: Session,
    origin_id: int,
) -> List[Invite]:
    try:
        # Get Invitations
        # ---
        return db.scalars(
            select(Invite)
            .where(
                Invite.origin_id == origin_id,
            )
        ).all()
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve invites"
        )
        # ---
# ---