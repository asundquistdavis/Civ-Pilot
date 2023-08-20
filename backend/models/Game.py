from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Boolean, String, ForeignKey
from typing import List


from .GamePlayer import GamePlayer
from .TurnPlayer import TurnPlayer
from .Player import Player
from .AdvancementCard import Base

class Game(Base):
    """each entry represents a game"""

    # unique attrs
    __tablename__ = 'game'
    id:Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    host_id:Mapped[int] = mapped_column(Integer, ForeignKey('player.id'))
    host:Mapped[Player] = relationship('Player', back_populates='hosted_game', uselist=False)
    
    # associated turns
    turns:Mapped[List['Turn']] = relationship('Turn', back_populates='game', cascade='all, delete-orphan')

    # associated gameplayer infos
    player_infos:Mapped[List[GamePlayer]] = relationship('GamePlayer', back_populates='game', cascade='all, delete-orphan')

    # game specific info
    turn_number:Mapped[int] = mapped_column(Integer, default=0)

    def __repr__(self):
        return f'Game: {self.id}, {self.host.username}, {self.turn_number}'

class Turn(Base):
    """each entry repesents a game turn"""
    
    __tablename__ = 'turn'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    number:Mapped[int] = mapped_column(Integer)
    game_id:Mapped[int] = mapped_column(Integer, ForeignKey('game.id'))
    game:Mapped['Game'] = relationship('Game', back_populates='turns', uselist=False)

    player_infos:Mapped[List[TurnPlayer]] = relationship('TurnPlayer', back_populates='turn')
