from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Boolean, String, ForeignKey
from typing import Any, List

from .GamePlayer import GamePlayer
from .TurnPlayer import TurnPlayer
from .AdvancementCard import Base

class Table:
    def __json__(self, flavor=None):
        ...

def json(table_instance:Table, flavor:str=None):
    if table_instance == None: return None
    return table_instance.__json__(flavor)

class Player(Base):
    """each entry represents a player"""

    # unique attrs
    __tablename__ = 'player'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    username:Mapped[str] = mapped_column(String)
    password:Mapped[str] = mapped_column(String)
    
    # related game the playe is host to
    # hosted_game_id:Mapped[int] = mapped_column(Integer, ForeignKey('game.id'), nullable=True)
    hosted_game:Mapped[Any] = relationship('Game', back_populates='host', uselist=False)

    # any games the player is part of
    game_infos:Mapped[List[GamePlayer]] = relationship('GamePlayer', back_populates='player')

    # any turns the player has played
    turn_infos:Mapped[List[TurnPlayer]] = relationship('TurnPlayer', back_populates='player')

    def __json__(self, flavor=None): 
        return {
            'id': self.id,
            'username': self.username,
            'games': [json(info, flavor='player') for info in self.game_infos],
        }
