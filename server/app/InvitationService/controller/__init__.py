from flask import Blueprint


# Tạo blueprint cho InvitationService
guest_api = Blueprint('guest_api', __name__)
def init_app():
    """Initialize all controllers for the AuthService."""
    from .guest_controller import init_guest_controller
    init_guest_controller()
    return guest_api
# Import controllers sau khi blueprint được định nghĩa
from . import guest_controller