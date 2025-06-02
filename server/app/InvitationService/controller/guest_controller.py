from flask import request, jsonify
from ...utils.middleware import JWT_required
from ...core.di_container import DIContainer

from .import guest_api
from ..service.guest_service import GuestService


class GuestController:
    def __init__(self, guest_service: GuestService):
        self.guest_service = guest_service
        self.register_routes()


    def register_routes(self):

        #lay danh sach guest theo user_id
        guest_api.add_url_rule('/', 'get_list_guest', self._wrap_jwt_required(self.get_list_guest_of_user), methods=['GET'])
        #them guest cho user
        guest_api.add_url_rule('/', 'create_guest', self._wrap_jwt_required(self.create_guest), methods=['POST'])
        #xoa guest theo id
        # guest_api.add_url_rule('/', 'delete_guest', self._wrap_jwt_required(self.delete_guest), methods=['DELETE'])
        # #sua guest theo id
        # guest_api.add_url_rule('/', 'update_guest', self._wrap_jwt_required(self.update_guest), methods=['PUT'])


        # #lay thiep moi theo nickname
        # guest_api.add_url_rule('/<string:nickname>', 'get_guest_by_nickname', self.get_guest_by_nickname, methods=['GET'])
        # #lay guest theo id
        # guest_api.add_url_rule('/id/<string:guest_id>', 'get_guest_by_id', self._wrap_jwt_required(self.get_guest_by_id), methods=['GET'])

    def _wrap_jwt_required(self, f):
        """Helper to maintain JWT required middleware while using class methods."""
        @JWT_required
        def wrapper(user_id):
            return f(user_id)
        return wrapper
    

    def get_list_guest_of_user(self, user_id):
        """Get all guests for a specific user."""
        guests = self.guest_service.get_guests_by_user_id(user_id)
        if not guests:
            return jsonify({"message": "No guests found for this user."}), 404
        # Convert each guest to dictionary format
        guests = [guest.as_dict() for guest in guests]
        return jsonify(guests), 200

    def create_guest(self, user_id):
        """Create a new guest for the user."""
        # handle ImmutableMultiDict to extract form data (include image)
        data = dict(request.form)
        images = request.files.getlist('images')
        if images:
            data['images'] = [image for image in images]
        # Convert form data to dictionary
        data = {key: value for key, value in data.items() if value}
        new_guest, new_images = self.guest_service.create_guest(user_id, data)
        if new_images:
            print("New guest created with images:", [image.image_url for image in new_images])
            guest_json = new_guest.as_dict()
            guest_json['images'] = [image.as_dict() for image in new_images]
        else:
            guest_json = new_guest.as_dict()
        return jsonify(guest_json), 201


def init_guest_controller():
    container = DIContainer.get_instance()
    guest_service = container.resolve(GuestService.__name__)
    return GuestController(guest_service)
