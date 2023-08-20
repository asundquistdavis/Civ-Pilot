from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Boolean, String, ForeignKey
from typing import Any, List

# from .GamePlayer import GamePlayer
from .AdvancementCard import Base, AdvancementCard

class TurnPlayer(Base):
    """each entry represents the historic relation between a player and a game"""

    __tablename__ = 'turnplayer'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    
    turn_id:Mapped[int] = mapped_column(Integer, ForeignKey('turn.id'))
    turn:Mapped[Any] = relationship('Turn', back_populates='player_infos', uselist=False)

    player_id:Mapped[int] = mapped_column(Integer, ForeignKey('player.id'))
    player:Mapped[Any] = relationship('Player', back_populates='turn_infos', uselist=False)

    advancement_cards:Mapped[List['TPAdvancementCardHistory']] = relationship('TPAdvancementCardHistory', back_populates='info')
    advancement_cards_purchase:Mapped[List['TPAdvancementCardPurchase']] = relationship('TPAdvancementCardPurchase', back_populates='info')

    calamities:Mapped[List[Any]] = relationship('Occurance', back_populates='info')

class TPAdvancementCardHistory(Base):
    """each entry represents the historic relation of a player owning a specific card"""

    __tablename__ = 'gpadvancementcardturn'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    info_id:Mapped[int] = mapped_column(Integer, ForeignKey('turnplayer.id'))
    info:Mapped['TurnPlayer'] = relationship('TurnPlayer', back_populates='advancement_cards', uselist=False)

    advancement_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advancementcard.id'))
    advancement_card:Mapped[AdvancementCard] = relationship('AdvancementCard', back_populates='players_history', uselist=False)

class TPAdvancementCardPurchase(Base):
    """each entry represents the relation of a player purchasing a card"""

    __tablename__ = 'gpadvancementcardselectionturn'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    info_id:Mapped[int] = mapped_column(Integer, ForeignKey('turnplayer.id'))
    info:Mapped['TurnPlayer'] = relationship('TurnPlayer', back_populates='advancement_cards_purchase', uselist=False)

    advancement_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advancementcard.id'))
    advancement_card:Mapped[AdvancementCard] = relationship('AdvancementCard', back_populates='players_purchase', uselist=False)

