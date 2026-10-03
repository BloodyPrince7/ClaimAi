import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
    from sarvamai import AsyncSarvamAI
    client = AsyncSarvamAI(api_subscription_key=settings.SARVAM_API_KEY)
except Exception as e:
    logger.warning(f"Failed to initialize Sarvam SDK client: {e}. Running in simulation/demo mode.")
    client = None
