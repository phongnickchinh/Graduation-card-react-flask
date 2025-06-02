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
        guest_api.add_url_rule('/', 'delete_guests', self._wrap_jwt_required(self.delete_guests), methods=['DELETE'])
        #sua guest theo id
        guest_api.add_url_rule('/', 'update_guest', self._wrap_jwt_required(self.update_guest), methods=['PUT'])


        # #lay thiep moi theo nickname
        guest_api.add_url_rule('/<string:nickname>', 'custom_invitation', self.custom_invitation, methods=['GET'])
        # #lay guest theo id
        guest_api.add_url_rule('/id/<string:guest_id>', 'view_guest_specific', self._wrap_jwt_required(self.view_guest_specific), methods=['GET'])

    def _wrap_jwt_required(self, f):
        """Helper to maintain JWT required middleware while using class methods."""
        @JWT_required
        def wrapper(user_id, *args, **kwargs):
            return f(user_id, *args, **kwargs)
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
    

    def delete_guests(self, user_id):
        """Delete a list guests for the user."""
        guest_ids = request.get_json().get('guest_ids')
        if not guest_ids or len(guest_ids) == 0:
            return jsonify({"message": "No guest IDs provided."}), 400
        if not isinstance(guest_ids, list):
            return jsonify({"message": "Guest IDs must be a list."}), 400
        
        try:
            result = self.guest_service.delete_guests(guest_ids)
            
            if result["failed_count"] == result["total"]:
                return jsonify({"message": "All guests not found or could not be deleted."}), 404
            elif result["success_count"] == result["total"]:
                return jsonify({"message": "All guests deleted successfully."}), 200
            else:
                return jsonify({
                    "message": "Some guests deleted successfully.",
                    "total": result["total"],
                    "deleted": result["success_count"],
                    "failed": result["failed_count"]
                }), 200
                
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except Exception as e:
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500

    
    def update_guest(self, user_id):
        """Update a guest for the user."""
        data = dict(request.form)
        images = request.files.getlist('images')
        if images:
            data['images'] = [image for image in images]
        
        guest_id = data.get('id')
        if not guest_id:
            return jsonify({"message": "Guest ID is required."}), 400
        
        try:
            updated_guest, images = self.guest_service.update_guest(user_id, guest_id, data)

            if images:
                print("Updated guest with new images:", [image.image_url for image in images])
                guest_json = updated_guest.as_dict()
                print("đến đây")
                guest_json['images'] = [image.as_dict() for image in images]
            else:
                guest_json = updated_guest.as_dict()
            return jsonify(guest_json), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        

    def custom_invitation(self, nickname):
        """Get guest by nickname to display custom invitation."""
        if not nickname:
            return jsonify({"message": "Nickname is required."}), 400
        
        # nick name có dạng Đồng_chí_Phong, phải loại bỏ dấu gạch dưới
        nickname = nickname.replace('_', ' ')
        guest, images = self.guest_service.get_guest_by_nickname(nickname)
        if not guest:
            return jsonify({"message": "Guest not found."}), 404
        if images:
            guest_json = guest.as_dict()
            guest_json['images'] = [image.as_dict() for image in images]
        else:
            guest_json = guest.as_dict()
        return jsonify(guest_json), 200

    def view_guest_specific(self, user_id, guest_id):
        """Get specific guest by ID."""
        if not guest_id:
            return jsonify({"message": "Guest ID is required."}), 400
        guest, images = self.guest_service.get_guest_by_id(guest_id)
        if not guest:
            return jsonify({"message": "Guest not found."}), 404
        if images:
            guest_json = guest.as_dict()
            guest_json['images'] = [image.as_dict() for image in images]
        else:
            guest_json = guest.as_dict()
        return jsonify(guest_json), 200

def init_guest_controller():
    container = DIContainer.get_instance()
    guest_service = container.resolve(GuestService.__name__)
    return GuestController(guest_service)
