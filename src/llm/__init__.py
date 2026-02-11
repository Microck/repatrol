from src.llm.client import LLMClient
from src.llm.foundry_client import FoundryLLMClient


def get_llm_client() -> LLMClient:
    # Default to mock mode for Phase 1 local dev.
    return FoundryLLMClient(mock=True)
