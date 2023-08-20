from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Boolean, String, ForeignKey
from typing import Any, List

from .AdvancementCard import Base, AdvancementCard

class GamePlayer(Base):
    """each entry represents the current relation between a player and a game"""

    __tablename__ = 'gameplayer'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
        
    game_id:Mapped[int] = mapped_column(Integer, ForeignKey('game.id'))
    game:Mapped[Any] = relationship('Game', back_populates='player_infos', uselist=False)

    player_id:Mapped[int] = mapped_column(Integer, ForeignKey('player.id'))
    player:Mapped[Any] = relationship('Player', back_populates='game_infos', uselist=False)

    advancement_cards:Mapped[List['GPAdvancementCard']] = relationship('GPAdvancementCard', back_populates='info')
    advancement_card_selected:Mapped[List['GPAdvancementCardSelection']] = relationship('GPAdvancementCardSelection', back_populates='info')

    def __json__(self, flavor=None): 
        if flavor == 'player': return {
            'gameId': self.game_id,
            'host': self.game.host.username,
            'hostId': self.game.host_id,
            'turnNumber': self.game.turn_number
        }

class GPAdvancementCard(Base):
    """each entry represents the relation of a player owning a specific card"""

    # unique attrs
    __tablename__ = 'gpadvancementcard'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    # associated gameplayer
    info_id:Mapped[int] = mapped_column(Integer, ForeignKey('gameplayer.id'))
    info:Mapped['GamePlayer'] = relationship('GamePlayer', back_populates='advancement_cards', uselist=False)

    # associated advcard
    advancement_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advancementcard.id'))
    advancement_card:Mapped[AdvancementCard] = relationship('AdvancementCard', back_populates='players_own', uselist=False)

    # additional info about the card
    cost_for:Mapped[int] = mapped_column(Integer)

class GPAdvancementCardSelection(Base):
    """each entry represents the relation of a player selecting a specific card"""

    # unique attrs
    __tablename__ = 'gpadvancementcardselection'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    # associated gameplayer
    info_id:Mapped[int] = mapped_column(Integer, ForeignKey('gameplayer.id'))
    info:Mapped['GamePlayer'] = relationship('GamePlayer', back_populates='advancement_card_selected', uselist=False)

    # associated advcard
    advancement_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advancementcard.id'))
    advancement_card:Mapped[AdvancementCard] = relationship('AdvancementCard', back_populates='players_selected', uselist=False)

