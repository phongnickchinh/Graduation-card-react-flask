from flask import Blueprint


# Tạo blueprint cho InvitationService
guestBook_api = Blueprint('guestBook_api', __name__)
def init_app():
    """Initialize all controllers for the AuthService."""
    from .guestBook_controller import init_guestbook_controller
    init_guestbook_controller()
    return guestBook_api
# Import controllers sau khi blueprint được định nghĩa
from . import guestBook_controller