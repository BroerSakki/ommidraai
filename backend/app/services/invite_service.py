# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from fastapi import HTTPException, Depends
# ---

# Import Schemas
# ---
from app.schemas import user_roles
from app.schemas import invite
# ---

# Import Models
# ---
from app.models.user import User
from app.models.invite import Invite
from app.models.user_group import User_Group
# ---

# Create invite
# ---
def create_invite(
    db: Session,
    current_user: User,
    group_id: int,
    username: str,
    role: invite.InviteRole
):
    user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == current_user.id,
        )
    )

    # Verify the user can send the invite
    if not user_roles.can_manage_user(
        actor = user_group.role,
        target = role,
    ):
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )

    # Get invitee user details
    invitee_user: User = db.scalar(
        select(User)
        .where(
            User.username == username
        )
    )

    if invitee_user == None:
        raise HTTPException(
            status_code=400,
            detail="User does not exist"
        )

    if invitee_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You canot invite yourself",
        )

    invitee_user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == invitee_user.id
		)
	)

    if invitee_user_group != None:
        raise HTTPException(
            status_code=400,
            detail="User already in group"
        )

    # Look for existing invite
    existing_invite: Invite = db.scalar(
        select(Invite)
        .where(
            Invite.user_id == invitee_user.id,
            Invite.group_id == group_id,
        )
    )

    try:
        if existing_invite is None:
            new_invite = Invite(
                user_id=invitee_user.id,
                origin_id=current_user.id,
                group_id=group_id,
                role=role
            )

            db.add(new_invite)
            db.commit()
            db.refresh(new_invite)
        else:
            existing_invite.role = role
            existing_invite.origin_id = current_user.id
            db.commit()
            db.refresh(existing_invite)
            return existing_invite
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invite could not be created"
		)
    
    return new_invite
# ---

# Get current user groups
# ---
def get_current_user_invites(
    db: Session,
    current_user: User,
): 
    # Go get from user_group all group_ids that current user_id is in
    return db.scalars(
        select(Invite)
        .where(
            Invite.user_id == current_user.id
        )
    ).all()
# ---

# See Pending Invites
# ---
def get_pending_invites(
    db: Session,
    current_user: User
):
    # Go get from user_group all group_ids that current user_id is in
    return db.scalars(
        select(Invite)
        .where(
            Invite.origin_id == current_user.id
        )
    ).all()
# ---

# Accept Invite
# ---
def accept_invite(
    db: Session,
    current_user: User,
    group_id: int,
):
    invite = db.scalar(
        select(Invite)
        .where(
            Invite.user_id == current_user.id,
            Invite.group_id == group_id,
        )
    )
    if invite is None:
        raise HTTPException(
            status_code=404,
            detail="Invite not found",
        )
    new_user_group = User_Group(
        user_id=current_user.id,
        group_id=group_id,
        role=invite.role,
    )
    db.add(new_user_group)
    db.delete(invite)
    db.commit()

    return {"message": f"Joined group as {new_user_group.role}"}
# ---

# Decline Invite
# ---
def decline_invite(
    db: Session,
    current_user: User,
    group_id: int,
):
    invite = db.scalar(
        select(Invite)
        .where(
            Invite.user_id == current_user.id,
            Invite.group_id == group_id,
        )
    )
    if invite is None:
        raise HTTPException(
            status_code=404,
            detail="Invite not found",
        )
    db.delete(invite)
    db.commit()

    return {"message": f"Declined invitation"}
# ---
