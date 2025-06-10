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
        #check unique nickname
        existed_guest = self.guest_repo.get_guest_by_nickname(guest_data['nickname'])
        if existed_guest:
            raise ValueError("Guest with the same nickname already exists.")
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


    def delete_guest(self, guest_id):
        #check exist guest
        guest = self.guest_repo.get_guest_by_id(guest_id)
        if not guest:
            raise ValueError("Guest not found.")
        #delete guest
        if not self.guest_repo.delete_guest(guest_id):
            raise ValueError("Failed to delete guest.")
        return True

    def delete_guests(self, guest_ids):
        """Delete multiple guests by their IDs and return deletion results."""
        if not guest_ids or not isinstance(guest_ids, list):
            raise ValueError("Guest IDs must be a non-empty list.")
        
        result = {
            "total": len(guest_ids),
            "success_count": 0,
            "failed_count": 0,
            "failed_ids": []
        }
        
        for guest_id in guest_ids:
            try:
                guest = self.get_guest_by_id(guest_id)
                if not guest:
                    result["failed_count"] += 1
                    result["failed_ids"].append(guest_id)
                    continue
                    
                if self.guest_repo.delete_guest(guest_id):
                    result["success_count"] += 1
                else:
                    result["failed_count"] += 1
                    result["failed_ids"].append(guest_id)
            except Exception:
                result["failed_count"] += 1
                result["failed_ids"].append(guest_id)
                
        return result

    def update_guest(self, user_id, guest_id, guest_data):
        # Bước 1: Kiểm tra khách mời có tồn tại không
        guest = self.guest_repo.get_guest_by_id(guest_id)
        if not guest:
            raise ValueError("Guest not found.")

        # Bước 2: Cập nhật thông tin khách mời (loại bỏ ảnh ra khỏi dữ liệu cập nhật)
        guest_data["user_id"] = user_id
        images = guest_data.pop("images", None)

        updated_guest = self.guest_repo.update_guest(guest_id, guest_data)
        if not updated_guest:
            raise ValueError("Failed to update guest.")

        # Bước 3: Nếu có ảnh mới → xoá ảnh cũ và thêm ảnh mới
        if images:
            # Lấy danh sách ảnh cũ để xóa khỏi Firebase Storage
            old_images = self.guest_repo.get_guest_images(guest_id)
            
            # Xóa ảnh cũ khỏi Firebase Storage
            if old_images:
                for old_image in old_images:
                    try:
                        self.firebase.delete_image(old_image.image_url)
                    except Exception as e:
                        print(f"Failed to delete old image: {e}")
                        # Continue even if deletion fails
            
            # Xóa record ảnh cũ khỏi database
            self.guest_repo.remove_all_guest_images(guest_id)
            uploaded_images = []

            for i, image in enumerate(images):
                if not image:
                    raise ValueError("Image cannot be empty.")
                # Upload ảnh lên Firebase với tên unique
                image_url = self.firebase.upload_image(image, f"guest_images/{guest_id}_{i}")
                if not image_url:
                    raise ValueError("Failed to upload image.")
                # Lưu ảnh vào database
                guest_image = self.guest_repo.add_guest_image(guest_id, image_url)
                uploaded_images.append(guest_image)

            return updated_guest, uploaded_images

        # Nếu không có ảnh mới
        return updated_guest, None



    def get_guest_by_nickname(self, nickname):
        guest = self.guest_repo.get_guest_by_nickname(nickname)
        if not guest:
            raise ValueError("Guest not found.")
        images = self.guest_repo.get_guest_images(guest.id)
        if not images:
            return guest, None
        return guest, images


    def get_guest_by_id(self, guest_id):
        guest = self.guest_repo.get_guest_by_id(guest_id)
        if not guest:
            raise ValueError("Guest not found.")
        images = self.guest_repo.get_guest_images(guest.id)
        if not images:
            return guest, None
        return guest, images
    

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
        #remove image from firebase storage
        try:
            self.firebase.delete_image(image_url)
        except Exception as e:
            print(f"Failed to delete image from Firebase: {e}")
            # Continue even if Firebase deletion fails
        #remove image from guest
        if not self.guest_repo.remove_guest_image(guest_id, image_url):
            raise ValueError("Failed to remove guest image.")
        return True
