from datetime import datetime, timezone
from typing import Any

from api.features.grammar.schemas import (
    GrammarCreate,
    GrammarExample,
    GrammarResponse,
    GrammarUpdate,
)
from surrealdb import AsyncSurreal


class GrammarService:
    @classmethod
    def get_table_name(cls, lang: str) -> str:
        """Dil bazlı izole SurrealDB tablo adı üretir (örn: french_grammar)."""
        return f"{lang.lower().strip()}_grammar"

    @classmethod
    def _normalize_id(cls, table_name: str, raw_id: str) -> str:
        return raw_id if ":" in raw_id else f"{table_name}:{raw_id}"

    @classmethod
    def _extract_id_str(cls, record_id: Any) -> str:
        return str(record_id)

    @classmethod
    def _to_response(cls, lang: str, record: dict[str, Any]) -> GrammarResponse:
        raw_examples = record.get("examples", [])
        examples_list = [
            GrammarExample(
                tr=ex.get("tr", ""),
                target=ex.get("target", ex.get("fr", "")),  # Geriye dönük uyumluluk
            )
            for ex in raw_examples
            if isinstance(ex, dict)
        ]

        raw_order = record.get("order", 1)
        try:
            parsed_order = int(raw_order)
        except (ValueError, TypeError):
            parsed_order = 1

        return GrammarResponse(
            id=cls._extract_id_str(record.get("id")),
            language=lang,
            topic=record.get("topic", ""),
            order=parsed_order,
            definition=record.get("definition", ""),
            examples=examples_list,
            createdAt=record.get("createdAt"),
            updatedAt=record.get("updatedAt"),
        )

    @classmethod
    async def get_all(cls, db: AsyncSurreal, lang: str) -> list[GrammarResponse]:
        table_name = cls.get_table_name(lang)
        records = await db.select(table_name)
        if not records:
            return []

        def get_sort_key(item: dict[str, Any]) -> tuple[int, str]:
            try:
                order_val = int(item.get("order", 1))
            except (ValueError, TypeError):
                order_val = 1
            created_val = str(item.get("createdAt", ""))
            return (order_val, created_val)

        sorted_records = sorted(records, key=get_sort_key)
        return [cls._to_response(lang, record) for record in sorted_records]

    @classmethod
    async def get_by_id(
        cls, db: AsyncSurreal, lang: str, record_id: str
    ) -> GrammarResponse | None:
        table_name = cls.get_table_name(lang)
        clean_id = cls._normalize_id(table_name, record_id)
        records = await db.select(clean_id)
        if not records:
            return None
        record = records[0] if isinstance(records, list) else records
        return cls._to_response(lang, record)

    @classmethod
    async def create(
        cls, db: AsyncSurreal, lang: str, payload: GrammarCreate
    ) -> GrammarResponse:
        table_name = cls.get_table_name(lang)
        now_iso = datetime.now(timezone.utc).isoformat()

        record_data = {
            "topic": payload.topic,
            "order": payload.order,
            "definition": payload.definition,
            "examples": [ex.model_dump() for ex in payload.examples],
            "createdAt": now_iso,
            "updatedAt": now_iso,
        }

        created = await db.create(table_name, record_data)
        record = created[0] if isinstance(created, list) else created
        return cls._to_response(lang, record)

    @classmethod
    async def update(
        cls, db: AsyncSurreal, lang: str, record_id: str, payload: GrammarUpdate
    ) -> GrammarResponse | None:
        table_name = cls.get_table_name(lang)
        clean_id = cls._normalize_id(table_name, record_id)
        update_data = {k: v for k, v in payload.model_dump().items() if v is not None}

        if not update_data:
            return None

        update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()

        updated = await db.merge(clean_id, update_data)
        if not updated:
            return None

        record = updated[0] if isinstance(updated, list) else updated
        return cls._to_response(lang, record)

    @classmethod
    async def delete(cls, db: AsyncSurreal, lang: str, record_id: str) -> bool:
        table_name = cls.get_table_name(lang)
        clean_id = cls._normalize_id(table_name, record_id)
        deleted = await db.delete(clean_id)
        return bool(deleted)
