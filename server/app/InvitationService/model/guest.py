from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from ...baseModel import BaseModel

class GuestImages(BaseModel):
    """
    Lớp đại diện cho bảng 'guest_images', chứa thông tin về hình ảnh của khách mời.
    """
    __tablename__ = 'guest_images'
    guest_id: Mapped[str] = mapped_column(String(36), ForeignKey('guests.id', ondelete='CASCADE'), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    guest = relationship('Guest', back_populates='images', foreign_keys=[guest_id])


    def __init__(self, guest_id: str, image_url: str, **kwargs):
        """Hàm khởi tạo cho GuestImages."""
        self.guest_id = guest_id
        self.image_url = image_url


class Guest(BaseModel):

    __tablename__ = 'guests'
    """
    Lớp đại diện cho bảng 'guests', chứa thông tin về khách mời.
    """
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    realname: Mapped[str] = mapped_column(String(100), nullable=False)
    nickname: Mapped[Optional[str]] = mapped_column(String(100), nullable=False, index=True)
    facebook: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    content: Mapped[str] = mapped_column(String(1000), nullable=True)
    images = relationship('GuestImages', back_populates='guest', cascade="all, delete-orphan", lazy='dynamic')


    def __init__(self, user_id: str, realname: str, content: Optional[str] = None,
                nickname: Optional[str] = None, facebook: Optional[str] = None,
                email: Optional[str] = None, phone: Optional[str] = None, **kwargs):
        """Hàm khởi tạo cho Guest."""
        self.user_id = user_id
        self.realname = realname
        self.nickname = nickname
        self.facebook = facebook
        self.email = email
        self.phone = phone
        self.content = content


    def __repr__(self):
        return f"<Guest id='{self.id}' user_id='{self.user_id}' realname='{self.realname}'>"
