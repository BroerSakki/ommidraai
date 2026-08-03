# Imports
# ---
from enum import Enum
# ---

# Class
# ---
class UserRole(str, Enum):
	creator = "creator"
	admin = "admin"
	member = "member"
	guest = "guest"
# ---

# Helper Functions
# ---
def can_manage_locations(role:UserRole) -> bool:
	return role in {
		UserRole.creator,
		UserRole.admin,
		UserRole.member,
	}

def can_delete_group(role: UserRole) -> bool:
	return role == UserRole.creator

def can_manage_user(actor: UserRole, target: UserRole) -> bool:
	if actor == UserRole.creator:
		return True

	if actor == UserRole.admin:
		return target in {
			UserRole.member,
			UserRole.guest,
		}

	return False
# ---