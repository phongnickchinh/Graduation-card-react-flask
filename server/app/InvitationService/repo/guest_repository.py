from .guest_interface import GuestInterface

from ..model.guest import Guest as GuestModel, GuestImages as GuestImagesModel
from ...UserService.model.user import User as UserModel

from ... import db


class GuestRepository(GuestInterface):
    def __init__(self):
        pass


    def get_guest_by_id(self, guest_id):
        return db.session.execute(
            db.select(GuestModel).where(
                GuestModel.id == guest_id,
                GuestModel.is_deleted == False
            )
        ).scalar_one_or_none()

    def get_guests_by_user_id(self, user_id):
        return db.session.execute(
            db.select(GuestModel).where(
                GuestModel.user_id == user_id,
                GuestModel.is_deleted == False
            )
        ).scalars().all()
    

    def get_guest_by_nickname(self, username, nickname):
        # 1. Đầu tiên, tìm user_id từ username trong bảng users
        from ...UserService.model.user import User as UserModel
        user = db.session.execute(
            db.select(UserModel).where(
                UserModel.username == username,
                UserModel.is_deleted == False
            )
        ).scalar_one_or_none()
        
        if not user:
            print(f"User with username '{username}' not found")
            return None
            
        # 2. Sau đó tìm guest với user_id và nickname
        return db.session.execute(
            db.select(GuestModel).where(
                GuestModel.nickname == nickname,
                GuestModel.user_id == user.id,
                GuestModel.is_deleted == False
            )
        ).scalar_one_or_none()
    

    def get_guest_by_phone(self, phone):
        return db.session.execute(
            db.select(GuestModel).where(
                GuestModel.phone == phone,
                GuestModel.is_deleted == False
            )
        ).scalar_one_or_none()


    def create_guest(self, guest_data):
        new_guest = GuestModel(**guest_data)

        return new_guest.save()

    def update_guest(self, guest_id, guest_data):
        print(f"Updating guest with ID: {guest_id} with data: {guest_data}")
        guest = self.get_guest_by_id(guest_id)
        if guest:
            for key, value in guest_data.items():
                setattr(guest, key, value)
            guest.save()
        return guest

    def delete_guest(self, guest_id):
        guest = self.get_guest_by_id(guest_id)
        if guest:
            guest.soft_delete()  # Giả lập xóa bằng cách đánh dấu là đã xóa
        return guest

    def add_guest_image(self, guest_id, image_url):
        new_image = GuestImagesModel(guest_id=guest_id, image_url=image_url)
        return new_image.save()

    def remove_guest_image(self, image_id):
        image = db.session.get(GuestImagesModel, image_id)
        if image:
            image.soft_delete()
        return image
    

    def remove_all_guest_images(self, guest_id):
        print(f"Removing all images for guest ID: {guest_id}")
        images = self.get_guest_images(guest_id)
        for image in images:
            print(f"Removing image: {image.image_url}")
            image.soft_delete()
        return images

    def get_guest_images(self, guest_id):
        return db.session.execute(
            db.select(GuestImagesModel).where(
                GuestImagesModel.guest_id == guest_id,
                GuestImagesModel.is_deleted == False
            )
        ).scalars().all()