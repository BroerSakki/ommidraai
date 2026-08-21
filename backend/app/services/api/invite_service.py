# Base Imports
# ---
from fastapi import Depends, HTTPException
from fastapi_pagination.ext.sqlalchemy import paginate
# ---

# Database Imports
# ---
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
# ---

# Import Models
# ---
from app.models.user import User
from app.models.group import Group
from app.models.invite_code import Invite_Code
# ---

# Import Schemas
# ---
from app.schemas import user_roles
from app.schemas import user_group as user_group_schemas
# ---

# Import Services
# ---
from app.services.database import invite_codes_table
from app.services.database import user_groups_table
from app.services.database import groups_table
# ---

# Create Invite Code
# ---
def create_invite_code(
    db: Session,
    current_user: User,
    group_id: int,
    role: user_roles.InviteRole
) -> Invite_Code:
    try:
        # Create Schema
        # ---
        invite_code_create = invite_codes_table.create_invite_code(
            db=db,
            origin_id=current_user.id,
            group_id=group_id,
            role=role,
        )
        # ---

        # Return
        # ---
        return invite_codes_table.add_invite_code(
            db=db,
            invite_code_create=invite_code_create,
        )
        # ---
    
    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=500,
            detail=("Could not create an invite code")
        )
        # ---
# ---

# Join Using Code
# ---
def join_with_invite_code(
    db: Session,
    current_user: User,
    code: int,
) -> Group:
    try:
        # Get Invite Code
        # ---
        invite_code = invite_codes_table.get_invite_code(
            db=db,
            code=code,
        )
        # ---

        # Create User Group
        # ---
        user_group = user_groups_table.add_user(
            db=db,
            user_group_create=user_group_schemas.UserGroupCreate(
                user_id=current_user.id,
                group_id=invite_code.group_id,
                role=invite_code.role
            )
        )
        # ---

        # Return
        # ---
        return groups_table.get_group(
            db=db,
            group_id=user_group.group_id,
        )
        # ---
        
    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=500,
            detail="Could not join group",
        )
        # ---
# ---