from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from ...baseModel import BaseModel


class GuestBook(BaseModel):
    """
    guest_book  lưu các lưu bút của khách viết cho chủ nhà
    """
    __tablename__ = "guest_book"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    guest_name: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(String(1000), nullable=False)
    image: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user = relationship('User', back_populates='guest_books', foreign_keys=[user_id])

    def __init__(self, user_id: str, guest_name: str, content: str, image: Optional[str] = None, **kwargs):
        """
        Hàm khởi tạo cho GuestBook.
        :param user_id: ID của người dùng (chủ nhà) mà khách viết lưu bút
        :param guest_name: Tên khách viết lưu bút
        :param content: Nội dung lưu bút
        :param images: URL hình ảnh đính kèm (nếu có)
        """
        self.user_id = user_id
        self.guest_name = guest_name
        self.content = content
        self.image = image