from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean, ForeignKey, JSON
from itertools import accumulate
from typing import Any, List

from .AdvancementCard import Base

class Civilization(Base):

    # creation class method(s)
    def from_raw(civilization):
        print(civilization)
        def setter(current, age, index):
            if age > current: current = age
            return index
        current = 0
        ages = [1]
        [ages.append(index+1) for index, age in enumerate(civilization['ages']) if age>len(ages)-1]
        print(ages)
        name = civilization['name']
        ast_rank = civilization['ast']
        color = civilization['color']
        return Civilization(ages=ages, name=name, ast_rank=ast_rank, color=color) 

    # unique attrs
    __tablename__ = 'civilization'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    ages:Mapped[dict] = mapped_column(JSON)
    name:Mapped[str] = mapped_column(String)
    ast_rank:Mapped[int] = mapped_column(Integer)
    color:Mapped[str] = mapped_column(String)

    # related gameplayer infos
    infos:Mapped[List[Any]] = relationship('GamePlayer', back_populates='civilization')

    def __json__(self, flavor:str=None):
        return {
            'civilization': self.name,
            'color': self.color,
            'ast': self.ast_rank,
            'ages': self.ages
        }
