from flask import request, jsonify
from ...utils.middleware import JWT_required
from ...core.di_container import DIContainer

from . import guestBook_api
from ..service.guestBook_service import GuestBookService


class GuestBookController:
    def __init__(self, guest_book_service: GuestBookService):
        self.guest_book_service = guest_book_service
        self.register_routes()

        
    def register_routes(self):
        # Lấy danh sách lưu bút theo user_id
        guestBook_api.add_url_rule('/', 'get_list_guest_books', self._wrap_jwt_required(self.get_list_guest_books), methods=['GET'])
        # Tạo mới một lưu bút
        guestBook_api.add_url_rule('/', 'create_guest_book', self._wrap_jwt_required(self.create_guest_book), methods=['POST'])
        # Tạo mới một lưu bút từ phía khách
        guestBook_api.add_url_rule('/add/<string:username>', 'create_guest_book_guestSide', self.create_guest_book_guestSide, methods=['POST'])
        # Cập nhật thông tin lưu bút
        guestBook_api.add_url_rule('/', 'update_guest_book', self._wrap_jwt_required(self.update_guest_book), methods=['PUT'])
        # Lấy thông tin lưu bút theo ID
        guestBook_api.add_url_rule('/<string:guest_book_id>', 'get_specific_guest_book', self._wrap_jwt_required(self.get_specific_guest_book), methods=['GET'])
        # Xóa lưu bút theo ID
        guestBook_api.add_url_rule('/', 'delete_guest_books', self._wrap_jwt_required(self.delete_guest_books), methods=['DELETE'])

    def _wrap_jwt_required(self, f):
        """Helper to maintain JWT required middleware while using class methods."""
        @JWT_required
        def wrapper(user_id, *args, **kwargs):
            return f(user_id, *args, **kwargs)
        return wrapper
    

    def get_list_guest_books(self, user_id):
        """Lấy danh sách lưu bút theo user_id."""
        guest_books = self.guest_book_service.get_list_guestBooks(user_id)
        return jsonify([guest_book.as_dict() for guest_book in guest_books]), 200
    

    def create_guest_book_guestSide(self, username):
        """Tạo mới một lưu bút từ phía khách."""
        guest_book_data = dict(request.form)
        image = request.files.get('image')
        # Handle ImmutableMultiDict to extract form data (include image)
        if image:
            guest_book_data['image'] = image
        else:
            guest_book_data['image'] = None
        print("im in controller")
        data = {key: value for key, value in guest_book_data.items() if value}
        new_guest_book = self.guest_book_service.create_guestBook_guestSide(username, data)
        return new_guest_book.as_dict(), 201


    def create_guest_book(self, user_id):
        """Tạo mới một lưu bút."""
        guest_book_data = dict(request.form)
        # Handle ImmutableMultiDict to extract form data (include image)
        image = request.files.get('image')
        if image:
            guest_book_data['image'] = image
        else:
            guest_book_data['image'] = None
        data = {key: value for key, value in guest_book_data.items() if value}

        new_guest_book = self.guest_book_service.create_guestBook(user_id, data)
        return new_guest_book.as_dict(), 201
    

    def update_guest_book(self, user_id):
        """Cập nhật thông tin lưu bút."""
        guest_book_data = dict(request.form)
        # Handle ImmutableMultiDict to extract form data (include image)
        image = request.files.get('image')
        if image:
            guest_book_data['image'] = image
        else:
            guest_book_data['image'] = None

        guestBook_id = guest_book_data.get("guest_book_id")
        if not guestBook_id:
            return jsonify({"message": "Guest book ID is required."}), 400
        if not isinstance(guestBook_id, str):
            return jsonify({"message": "Guest book ID must be a string."}), 400
        guest_book_data.pop("guest_book_id", None)  # Remove ID from data to avoid updating it
        updated_guest_book = self.guest_book_service.update_guestBook(guestBook_id, guest_book_data)
        return updated_guest_book.as_dict(), 200
    

    def get_specific_guest_book(self, user_id, guest_book_id):
        """Lấy thông tin lưu bút theo ID."""
        guest_book = self.guest_book_service.get_specific_guestBook(guest_book_id)
        print(guest_book)
        if not guest_book:
            return jsonify({"message": "Guest book not found"}), 404
        return jsonify(guest_book.as_dict()), 200
    

    def delete_guest_books(self, user_id):
        """Xóa lưu bút theo ID."""
        guest_book_ids = request.get_json().get('guest_book_ids')
        if not guest_book_ids or len(guest_book_ids) == 0:
            return jsonify({"message": "No guest IDs provided."}), 400
        if not isinstance(guest_book_ids, list):
            return jsonify({"message": "Guest IDs must be a list."}), 400
        
        try:
            result = self.guest_book_service.delete_guestBooks(guest_book_ids)

            if result["failed_count"] == result["total"]:
                return jsonify({"message": "All guest books not found or could not be deleted."}), 404
            elif result["success_count"] == result["total"]:
                return jsonify({"message": "All guest books deleted successfully."}), 200
            else:
                return jsonify({
                    "message": "Some guest books deleted successfully.",
                    "total": result["total"],
                    "deleted": result["success_count"],
                    "failed": result["failed_count"]
                }), 200
                
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except Exception as e:
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Initialize the GuestBookController with the DIContainer
def init_guestbook_controller():
    container = DIContainer.get_instance()
    guest_book_service = container.resolve(GuestBookService.__name__)
    return GuestBookController(guest_book_service)