
from ..core.di_container import DIContainer

_is_initialized = False

def setup_dependencies():
    """Register all dependencies in the container."""
    global _is_initialized
    
    if _is_initialized:
        return
    
    # Import interfaces inside the function to avoid circular imports
    from ..UserService.repo.user_interface import UserInterface
    from ..UserService.repo.user_repository import UserRepository

    from ..AuthService.repo.token_interface import TokenInterface
    from ..AuthService.repo.token_repository import TokenRepository

    from ..UserService.repo.role_interface import RoleInterface, UserRoleInterface
    from ..UserService.repo.role_repository import RoleRepository, UserRoleRepository

    from ..InvitationService.repo.guest_interface import GuestInterface
    from ..InvitationService.repo.guest_repository import GuestRepository

    from ..utils.firebase_interface import FirebaseInterface
    from ..utils.firebase_helper import FirebaseHelper

    # Import services
    from ..UserService.service.user_service import UserService
    from ..UserService.service.edit_service import EditService
    from ..AuthService.service.auth_service import AuthService
    from ..InvitationService.service.guest_service import GuestService
    
    # Import concrete implementations
    # These will be your actual repository implementations
    # from ..UserService.repo.sql_user_repo import SQLUserRepository
    # from ..AuthService.repo.sql_token_repo import SQLTokenRepository
    # from ..UserService.repo.sql_role_repo import SQLRoleRepository, SQLUserRoleRepository
    
    container = DIContainer.get_instance()
    
    # Register dependencies using the interface name as the key
    container.register(FirebaseInterface.__name__, FirebaseHelper)
    container.register(UserInterface.__name__, UserRepository)
    container.register(TokenInterface.__name__, TokenRepository)
    container.register(RoleInterface.__name__, RoleRepository)
    container.register(UserRoleInterface.__name__, UserRoleRepository)
    container.register(GuestInterface.__name__, GuestRepository)
    # Register services
    container.register(AuthService.__name__, AuthService)
    container.register(UserService.__name__, UserService)
    container.register(EditService.__name__, EditService)
    container.register(GuestService.__name__, GuestService)
    
    _is_initialized = True
    return container

# Initialize the dependency injection system
def init_di():
    """Initialize the dependency injection system.
    Call this function from your application's entry point."""
    return setup_dependencies()
