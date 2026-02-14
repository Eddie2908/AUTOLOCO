"""
Schémas Pydantic pour la recherche
===================================
"""

from pydantic import BaseModel
from typing import Optional, List


class SearchSuggestion(BaseModel):
    text: str
    type: str  # brand, model, city
    count: int = 0


class SearchResult(BaseModel):
    id: str
    type: str  # vehicle, user
    title: str
    subtitle: Optional[str]
    image: Optional[str]
