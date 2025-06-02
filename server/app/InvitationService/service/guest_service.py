


from ...core.di_container import DIContainer
from ..repo.guest_interface import GuestInterface
from ...utils.firebase_interface import FirebaseInterface

class GuestService:
    def __init__(self):
        container = DIContainer.get_instance()
        self.guest_repo = container.resolve(GuestInterface.__name__)
        self.firebase = container.resolve(FirebaseInterface.__name__)

    def get_guests_by_user_id(self, user_id):
        return self.guest_repo.get_guests_by_user_id(user_id)


    def create_guest(self, user_id, guest_data):
        guest_data['user_id'] = user_id
        new_guest = self.guest_repo.create_guest(guest_data)
        if not new_guest:
            raise ValueError("Failed to create guest.")
        #add image if exists
        if 'images' in guest_data:
            images = []
            for image in guest_data['images']:
                if not image:
                    raise ValueError("Image cannot be empty.")
                #upload image to firebase
                image_url = self.firebase.upload_image(image, f"guest_images/{new_guest.id}")
                if not image_url:
                    raise ValueError("Failed to upload image.")
                #add image to guest
                image = self.guest_repo.add_guest_image(new_guest.id, image_url)
                images.append(image)

        return new_guest, images if 'images' in guest_data else None


    def delete_guest(self, user_id, guest_id):
        return self.guest_repo.delete_guest(guest_id)


    def update_guest(self, user_id, guest_id, guest_data):
        return self.guest_repo.update_guest(guest_id, guest_data)


    def get_guest_by_nickname(self, nickname):
        return self.guest_repo.get_guest_by_nickname(nickname)


    def get_guest_by_id(self, guest_id):
        return self.guest_repo.get_guest_by_id(guest_id)
    

    def add_guest_image(self, guest_id, raw_image):
        #check exist guest
        guest = self.guest_repo.get_guest_by_id(guest_id)
        if not guest:
            raise ValueError("Guest not found.")
        if not raw_image:
            raise ValueError("Image cannot be empty.")
        #upload image to firebase
        image_url = self.firebase.upload_image(raw_image, f"guest_images/{guest_id}")
        if not image_url:
            raise ValueError("Failed to upload image.")
        #add image to guest
        image = self.guest_repo.add_guest_image(guest_id, image_url)
        #return image url
        return image
    

    def remove_guest_image(self, guest_id, image_url):
        #check exist guest
        guest = self.guest_repo.get_guest_by_id(guest_id)
        if not guest:
            raise ValueError("Guest not found.")
        #remove image from guest
        return self.guest_repo.remove_guest_image(guest_id, image_url)
