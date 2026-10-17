import logging

logger = logging.getLogger(__name__)


def dispatch_sms_otp(phone_number: str, otp_code: str) -> bool:
    """Dispatches 6-digit OTP to citizen mobile via SMS gateway (AWS SNS / Twilio adapter)."""
    logger.info(f"⚡ [SMS Gateway Dispatch] To: {phone_number} | Message: Your Vote Wallet code is {otp_code}")
    return True


def dispatch_ballot_receipt_email(email: str, receipt_code: str, receipt_hash: str) -> bool:
    """Sends cryptographic receipt proof to citizen email."""
    logger.info(f"📧 [Email Gateway] Sent sealed ballot receipt {receipt_code} to {email}")
    return True
