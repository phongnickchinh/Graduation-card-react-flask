from flask import request, jsonify
from ...utils.middleware import JWT_required
from ...core.di_container import DIContainer

from .import story_api
from ..service.story_service import StoryService


class StoryController:
    def __init__(self, story_service: StoryService):
        self.story_service = story_service
        self.register_routes()
    def register_routes(self):
        # Get all stories for a specific user
        story_api.add_url_rule('/', 'get_list_story', self._wrap_jwt_required(self.get_list_story_of_user), methods=['GET'])
        # Create a new story for the user
        story_api.add_url_rule('/', 'create_story', self._wrap_jwt_required(self.create_story), methods=['POST'])
        # Delete stories by IDs
        story_api.add_url_rule('/', 'delete_stories', self._wrap_jwt_required(self.delete_stories), methods=['DELETE'])
        # Update a story by ID
        story_api.add_url_rule('/', 'update_story', self._wrap_jwt_required(self.update_story), methods=['PUT'])


    def _wrap_jwt_required(self, f):
        """Helper to maintain JWT required middleware while using class methods."""
        @JWT_required
        def wrapper(user_id, *args, **kwargs):
            return f(user_id, *args, **kwargs)
        return wrapper
    

    def init_story_controller(self):
        """Initialize the StoryController with the StoryService."""
        container = DIContainer.get_instance()
        story_service = container.resolve(StoryService.__name__)
        return StoryController(story_service)