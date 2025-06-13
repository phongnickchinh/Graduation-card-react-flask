from .guestbook_interface import GuestBookInterface
from ..model.guestBook import GuestBook as GuestBookModel
from ... import db


class GuestBookRepository(GuestBookInterface):

    def __init__(self):
        pass
    
    
    def get_guest_book_by_id(self, guest_book_id: str) -> GuestBookModel:
        return db.session.execute(
            db.select(GuestBookModel).where(
                GuestBookModel.id == guest_book_id,
                GuestBookModel.is_deleted == False
            )
        ).scalar_one_or_none()


    def get_guest_books_by_user_id(self, user_id: str) -> list[GuestBookModel]:
        return db.session.execute(
            db.select(GuestBookModel).where(
                GuestBookModel.user_id == user_id,
                GuestBookModel.is_deleted == False
            )
        ).scalars().all()


    def create_guest_book(self, guest_book) -> GuestBookModel:
        guest_book = GuestBookModel(**guest_book)
        return guest_book.save()


    def update_guest_book(self, guest_book_id: str, guest_book: dict) -> GuestBookModel:
        """Cập nhật thông tin lưu bút."""
        existing_guest_book = self.get_guest_book_by_id(guest_book_id)
        if existing_guest_book:
            for key, value in guest_book.items():
                setattr(existing_guest_book, key, value)
                existing_guest_book.save()
        return existing_guest_book
                

    def delete_guest_book(self, guest_book_id: str) -> None:
        guest_book = self.get_guest_book_by_id(guest_book_id)
        if guest_book:
            guest_book.is_deleted = True
            db.session.commit()