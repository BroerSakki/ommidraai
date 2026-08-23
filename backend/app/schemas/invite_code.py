# Imports
# ---
import random
from pydantic import BaseModel
from app.schemas import user_roles
from dotenv import load_dotenv
import os
# ---

# Load Constants
# ---
load_dotenv()
INVITE_CODE_MIN: int = int(os.getenv("INVITE_CODE_MIN"))
INVITE_CODE_MAX: int = int(os.getenv("INVITE_CODE_MAX"))
if INVITE_CODE_MIN is None:
    raise RuntimeError("INVITE_CODE_MIN is not set")
if INVITE_CODE_MAX is None:
    raise RuntimeError("INVITE_CODE_MAX is not set")
# ---

# Class
# ---
class Invite_Code_Create(BaseModel):
    origin_id: int
    group_id: int
    role: user_roles.InviteRole
# ---

# Methods
# ---
def generate_code() -> int:
    return random.randint(
        INVITE_CODE_MIN,
        INVITE_CODE_MAX,
    )
# ---