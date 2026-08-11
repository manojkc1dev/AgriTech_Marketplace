import os
from PIL import Image
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB Limit
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}


def validate_product_image(file) -> None:
    if file.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(_("File size exceeds maximum allowed limit of 5MB."))

    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(_("Unsupported file extension. Allowed: .jpg, .jpeg, .png, .webp"))

    try:
        file.seek(0)
        img = Image.open(file)
        img.verify()
        
        if img.format.upper() not in ['JPEG', 'PNG', 'WEBP']:
            raise ValidationError(_("Invalid image file header encoding."))
        file.seek(0)
    except Exception as exc:
        raise ValidationError(_("Uploaded file is not a valid image.")) from exc