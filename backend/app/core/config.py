from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CliniqAI"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/cliniqai"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Auth
    JWT_SECRET: str = "change-me-to-a-random-64-char-string"
    JWT_REFRESH_SECRET: str = "change-me-to-another-random-64-char-string"
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    # Sarvam AI (Voice AI — STT, TTS, Samvaad Agent)
    SARVAM_API_KEY: str = ""
    SARVAM_WEBHOOK_SECRET: str = ""
    SARVAM_AGENT_ID: str = ""

    # Exotel (Indian Telephony)
    EXOTEL_API_KEY: str = ""
    EXOTEL_API_TOKEN: str = ""
    EXOTEL_SID: str = ""
    EXOTEL_SUBDOMAIN: str = ""

    # OpenAI (Embeddings)
    OPENAI_API_KEY: str = ""

    # Anthropic (LLM)
    ANTHROPIC_API_KEY: str = ""

    # Razorpay (Payments)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Gupshup (WhatsApp)
    GUPSHUP_API_KEY: str = ""
    GUPSHUP_APP_NAME: str = ""

    # SMS
    SMS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
