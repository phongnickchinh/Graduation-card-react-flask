from .guest_interface import GuestInterface

from ..model.guest import Guest as GuestModel, GuestImages as GuestImagesModel

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

    def create_guest(self, guest_data):
        new_guest = GuestModel(**guest_data)

        return new_guest.save()

    def update_guest(self, guest_id, guest_data):
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

    def get_guest_images(self, guest_id):
        return db.session.execute(
            db.select(GuestImagesModel).where(
                GuestImagesModel.guest_id == guest_id,
                GuestImagesModel.is_deleted == False
            )
        ).scalars().all()