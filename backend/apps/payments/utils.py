import base64
import hashlib
import hmac
import requests


# --- eSewa Utilities ---
def generate_esewa_signature(
    total_amount: str, transaction_uuid: str, product_code: str, secret_key: str
) -> str:
    """Generates HMAC-SHA256 signature required for eSewa v2."""
    data = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    hash_obj = hmac.new(
        secret_key.encode("utf-8"), data.encode("utf-8"), hashlib.sha256
    ).digest()
    return base64.b64encode(hash_obj).decode("utf-8")


# --- Khalti Utilities ---
KHALTI_INITIATE_URL = "https://dev.khalti.com/api/v2/epayment/initiate/"
KHALTI_LOOKUP_URL = "https://dev.khalti.com/api/v2/epayment/lookup/"
KHALTI_SANDBOX_SECRET_KEY = "key 05bf95cc57244045b8df5fad06748dab"


def initiate_khalti_payment(
    return_url, purchase_order_id, purchase_order_name, amount_in_paisa
):
    headers = {
        "Authorization": KHALTI_SANDBOX_SECRET_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "return_url": return_url,
        "website_url": "http://localhost:8000/",
        "amount": str(amount_in_paisa),
        "purchase_order_id": purchase_order_id,
        "purchase_order_name": purchase_order_name,
    }
    response = requests.post(
        KHALTI_INITIATE_URL, json=payload, headers=headers
    )
    return response.json(), response.status_code


def verify_khalti_payment(pidx):
    headers = {
        "Authorization": KHALTI_SANDBOX_SECRET_KEY,
        "Content-Type": "application/json",
    }
    payload = {"pidx": pidx}
    response = requests.post(KHALTI_LOOKUP_URL, json=payload, headers=headers)
    return response.json(), response.status_code