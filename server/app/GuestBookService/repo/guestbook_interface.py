from abc import ABC, abstractmethod
from ..model.guestBook import GuestBook as GuestBookModel
from typing import List, Optional


class GuestBookInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def get_guest_book_by_id(self, guest_book_id: str) -> Optional[GuestBookModel]:
        """Lấy thông tin lưu bút theo ID."""
        pass

    @abstractmethod
    def get_guest_books_by_user_id(self, user_id: str) -> List[GuestBookModel]:
        """Lấy danh sách lưu bút theo ID người dùng."""
        pass

    @abstractmethod
    def create_guest_book(self, guest_book: GuestBookModel) -> GuestBookModel:
        """Tạo mới một lưu bút."""
        pass

    @abstractmethod
    def update_guest_book(self, guest_book: GuestBookModel) -> GuestBookModel:
        """Cập nhật thông tin lưu bút."""
        pass

    @abstractmethod
    def delete_guest_book(self, guest_book_id: str) -> None:
        """Xóa lưu bút theo ID."""
        pass