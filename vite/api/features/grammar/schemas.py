from typing import Literal

from pydantic import BaseModel, Field

SUPPORTED_LANGUAGES = Literal[
    "french", "german", "english", "spanish", "italian", "russian", "arabic"
]


class GrammarExample(BaseModel):
    tr: str = Field(..., min_length=1, description="Türkçe örnek cümle")
    target: str = Field(..., min_length=1, description="Hedef dildeki örnek cümle")


class GrammarCreate(BaseModel):
    topic: str = Field(
        ..., min_length=1, max_length=200, description="Gramer konu başlığı"
    )
    order: int = Field(
        default=1, ge=1, description="Konunun müfredat sıra numarası (Pozitif tamsayı)"
    )
    definition: str = Field(
        ..., min_length=1, description="Gramer tanımı ([[token]] destekli)"
    )
    examples: list[GrammarExample] = Field(
        ...,
        min_length=7,
        max_length=7,
        description="Zorunlu tam 7 adet TR/Hedef Dil ikili örnek çifti",
    )


class GrammarUpdate(BaseModel):
    topic: str | None = Field(default=None, min_length=1, max_length=200)
    order: int | None = Field(
        default=None, ge=1, description="Konunun müfredat sıra numarası"
    )
    definition: str | None = Field(default=None, min_length=1)
    examples: list[GrammarExample] | None = Field(
        default=None, min_length=7, max_length=7
    )


class GrammarResponse(BaseModel):
    id: str
    language: str
    topic: str
    order: int = 1
    definition: str
    examples: list[GrammarExample]
    createdAt: str | None = None
    updatedAt: str | None = None
