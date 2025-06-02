from abc import ABC, abstractmethod
from ..model.guest import Guest as GuestModel, GuestImages as GuestImagesModel
from typing import List, Optional


class GuestInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def get_guest_by_id(self, guest_id: str) -> Optional[GuestModel]:
        """Lấy thông tin khách mời theo ID."""
        pass

    @abstractmethod
    def get_guests_by_user_id(self, user_id: str) -> List[GuestModel]:
        """Lấy danh sách khách mời theo ID người dùng."""
        pass


    @abstractmethod
    def get_guest_by_nickname(self, nickname: str) -> Optional[GuestModel]:
        """Lấy thông tin khách mời theo nickname."""
        pass

    @abstractmethod
    def get_guest_by_phone(self, phone: str) -> Optional[GuestModel]:
        """Lấy thông tin khách mời theo số điện thoại."""
        pass

    @abstractmethod
    def create_guest(self, guest: GuestModel) -> GuestModel:
        """Tạo mới một khách mời."""
        pass

    @abstractmethod
    def update_guest(self, guest: GuestModel) -> GuestModel:
        """Cập nhật thông tin khách mời."""
        pass

    @abstractmethod
    def delete_guest(self, guest_id: str) -> None:
        """Xóa khách mời theo ID."""
        pass

    @abstractmethod
    def add_guest_image(self, guest_image: GuestImagesModel) -> GuestImagesModel:
        """Thêm hình ảnh cho khách mời."""
        pass

    @abstractmethod
    def remove_guest_image(self, image_id: str) -> None:
        """Xóa hình ảnh của khách mời theo ID."""
        pass


    @abstractmethod
    def remove_all_guest_images(self, guest_id: str) -> None:
        """Xóa tất cả hình ảnh của khách mời theo ID khách mời."""
        pass

    @abstractmethod
    def get_guest_images(self, guest_id: str) -> List[GuestImagesModel]:
        """Lấy danh sách hình ảnh của khách mời theo ID khách mời."""
        pass



