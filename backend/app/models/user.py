from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: str = Field(default="demo_user", primary_key=True)
    name: str = Field(default="Ramesh Kumar")
    preferred_lang: str = Field(default="hi-IN")
