import hmac
import hashlib
import base64

def generate_esewa_signature(secret_key, message):
    """
    Generates HMAC-SHA256 base64 encoded signature for eSewa ePay v2.0
    """
    key = secret_key.encode('utf-8')
    message = message.encode('utf-8')
    result = hmac.new(key, message, hashlib.sha256).digest()
    signature = base64.b64encode(result).decode('utf-8')
    return signature