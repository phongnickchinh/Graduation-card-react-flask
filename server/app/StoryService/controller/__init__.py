from flask import Blueprint


# Tạo blueprint cho InvitationService
story_api = Blueprint('story_api', __name__)
def init_app():
    """Initialize all controllers for the AuthService."""
    from .story_controller import init_story_controller
    init_story_controller()
    return story_api
# Import controllers sau khi blueprint được định nghĩa
from . import story_controller