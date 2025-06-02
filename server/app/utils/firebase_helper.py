from flask import current_app as app
import firebase_admin
from firebase_admin import credentials, storage
from .firebase_interface import FirebaseInterface


class FirebaseHelper(FirebaseInterface):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseHelper, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def _initialize(self):
        """Initialize Firebase only when needed"""
        if not self._initialized:
            try:
                if not firebase_admin._apps:
                    cred = credentials.Certificate(app.config["FIREBASE_CREDENTIALS_PATH"])
                    firebase_admin.initialize_app(cred, {
                        'storageBucket': app.config["FIREBASE_STORAGE_BUCKET"]
                    })
                self.bucket = storage.bucket()
                self._initialized = True
            except Exception as e:
                print(f"Firebase initialization error: {str(e)}")
                raise

    def upload_image(self, file, filename):
        """Upload image to Firebase Storage
        Args:
            file: File object to upload
            filename: Path in storage (e.g. 'groups/avatar1.jpg')
        Returns:
            str: Public URL of uploaded file or None if failed
        """
        self._initialize()
        try:
            blob = self.bucket.blob(filename)
            blob.upload_from_file(file, content_type=file.content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"Upload error: {str(e)}")
            return None
