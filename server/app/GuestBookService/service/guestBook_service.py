from ...core.di_container import DIContainer
from ..repo.guestbook_interface import GuestBookInterface
from ...UserService.repo.user_interface import UserInterface
from ...utils.firebase_interface import FirebaseInterface


class GuestBookService:


    def __init__(self):
        container = DIContainer.get_instance()
        self.guest_book_repo = container.resolve(GuestBookInterface.__name__)
        self.firebase = container.resolve(FirebaseInterface.__name__)
        self.user_repo = container.resolve(UserInterface.__name__)

    def get_specific_guestBook(self, guest_book_id: str):
        """Lấy thông tin lưu bút theo ID."""
        print(f"Fetching guest book with ID: {guest_book_id}")
        return self.guest_book_repo.get_guest_book_by_id(guest_book_id)
    

    def get_list_guestBooks(self, user_id: str):
        """Lấy danh sách lưu bút theo ID người dùng."""
        return self.guest_book_repo.get_guest_books_by_user_id(user_id)
    

    def get_list_guestBooks_by_username(self, username: str):
        """Lấy danh sách lưu bút theo tên người dùng."""
        user = self.user_repo.get_user_by_username(username)
        if not user:
            raise ValueError("User not found.")
        return self.guest_book_repo.get_guest_books_by_user_id(user.id)
    

    def create_guestBook(self, user_id: str, guest_book_data: dict):
        """Tạo mới một lưu bút."""
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found.")
        guest_book_data['user_id'] = user_id

        # Xử lý hình ảnh nếu có
        if 'image' in guest_book_data and guest_book_data['image']:
            image_url = self.firebase.upload_image(guest_book_data['image'], f"guest_books/{guest_book_data['image'].filename}")
            if not image_url:
                raise ValueError("Failed to upload image.")
            guest_book_data['image'] = image_url

        new_guest_book = self.guest_book_repo.create_guest_book(guest_book_data)
        return new_guest_book


    def create_guestBook_guestSide(self, username: str, guest_book_data: dict):
        """Tạo mới một lưu bút từ phía khách."""
        user = self.user_repo.get_user_by_username(username)
        if not user:
            raise ValueError("User not found.")
        guest_book_data['user_id'] = user.id

        # Xử lý hình ảnh nếu có
        if 'image' in guest_book_data and guest_book_data['image']:
            image_url = self.firebase.upload_image(guest_book_data['image'], f"guest_books/{guest_book_data['image'].filename}")
            if not image_url:
                raise ValueError("Failed to upload image.")
            guest_book_data['image'] = image_url

        new_guest_book = self.guest_book_repo.create_guest_book(guest_book_data)
        return new_guest_book
    

    def update_guestBook(self, guest_book_id: str, guest_book_data: dict):
        """Cập nhật thông tin lưu bút."""
        guest_book = self.guest_book_repo.get_guest_book_by_id(guest_book_id)
        if not guest_book:
            raise ValueError("Guest book not found.")
        
        # Cập nhật thông tin lưu bút
        guest_book_data['user_id'] = guest_book.user_id  # Giữ nguyên user_id
        if 'image' in guest_book_data and guest_book_data['image']:
            # Xóa ảnh cũ nếu có
            if guest_book.image:
                try:
                    self.firebase.delete_image(guest_book.image)
                except Exception as e:
                    print(f"Failed to delete old image: {e}")

            # Tải ảnh mới lên Firebase
            image_url = self.firebase.upload_image(guest_book_data['image'], f"guest_books/{guest_book_data['image'].filename}")
            if not image_url:
                raise ValueError("Failed to upload new image.")
            guest_book_data['image'] = image_url
        else:
            guest_book_data['image'] = guest_book.image
        updated_guestBook = self.guest_book_repo.update_guest_book(guest_book_id, guest_book_data)
        if not updated_guestBook:
            raise ValueError("Failed to update guest book.")
        return updated_guestBook
            

    def delete_guestBooks(self, guest_book_ids: list):
        """Xóa lưu bút theo ID."""
        if not guest_book_ids:
            raise ValueError("No guest book IDs provided.")

        deleted_count = 0
        for guest_book_id in guest_book_ids:
            guest_book = self.guest_book_repo.get_guest_book_by_id(guest_book_id)
            if not guest_book:
                continue

            # Xóa ảnh nếu có
            if guest_book.image:
                try:
                    self.firebase.delete_image(guest_book.image)
                except Exception as e:
                    print(f"Failed to delete image: {e}")

            self.guest_book_repo.delete_guest_book(guest_book_id)
            deleted_count += 1

        return {"total": len(guest_book_ids), "success_count": deleted_count, "failed_count": len(guest_book_ids) - deleted_count}


    def get_guestBook_by_nickname(self, nickname: str):
        """Lấy lưu bút theo nickname của khách."""
        guest_book = self.guest_book_repo.get_guest_book_by_nickname(nickname)
        if not guest_book:
            raise ValueError("Guest book not found.")
        
        # Lấy ảnh nếu có
        images = self.guest_book_repo.get_guest_book_images(guest_book.id)
        return guest_book, images