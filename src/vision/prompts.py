from __future__ import annotations


GAME_STATE_SCHEMA = {
    "type": "object",
    "required": [
        "screen_id",
        "summary",
        "action_hints",
        "ui_elements",
        "is_loading",
        "warnings",
    ],
    "properties": {
        "screen_id": {"type": "string"},
        "summary": {"type": "string"},
        "action_hints": {
            "type": "array",
            "items": {"type": "string"},
        },
        "ui_elements": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["label", "type"],
                "properties": {
                    "label": {"type": "string"},
                    "type": {"type": "string"},
                    "location": {"type": "string"},
                },
            },
        },
        "is_loading": {"type": "boolean"},
        "warnings": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
}


GAME_STATE_PROMPT = """
You are analyzing a game screenshot for autonomous QA.

Return one JSON object with the schema provided.
Focus on practical automation details:
- Which coarse screen is visible (TITLE, PLAY, MENU, SETTINGS, CRASH, etc.)
- What actions are likely useful next
- Whether the game appears to be loading
- Any warning signs (errors, frozen UI, broken layout)
""".strip()
