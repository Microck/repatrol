from src.llm.client import LLMClient
from src.llm.foundry_client import FoundryLLMClient


def get_llm_client() -> LLMClient:
    return FoundryLLMClient()
