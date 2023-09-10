from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Boolean, String, ForeignKey, JSON
from typing import Any, List

from .AdvancementCard import Base, AdvancementCard
from .Civilization import Civilization

class Table:
    def __json__(self, flavor=None):
        ...

def json(table_instance:Table, flavor:str=None)->dict:
    if table_instance == None: return {}
    return table_instance.__json__(flavor)

class GamePlayer(Base):
    """each entry represents the current relation between a player and a game"""

    # unique attrs
    __tablename__ = 'gameplayer'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
        
    # related game
    game_id:Mapped[int] = mapped_column(Integer, ForeignKey('game.id'))
    game:Mapped[Any] = relationship('Game', back_populates='player_infos', uselist=False)

    # related player
    player_id:Mapped[int] = mapped_column(Integer, ForeignKey('player.id'))
    player:Mapped[Any] = relationship('Player', back_populates='game_infos', uselist=False)

    # related adv cards
    advancement_cards:Mapped[List['GPAdvancementCard']] = relationship('GPAdvancementCard', back_populates='info')
    advancement_card_selected:Mapped[List['GPAdvancementCardSelection']] = relationship('GPAdvancementCardSelection', back_populates='info')

    # related civ obj
    civilization_id:Mapped[int] = mapped_column(Integer, ForeignKey('civilization.id'), nullable=True)
    civilization:Mapped[Civilization] = relationship("Civilization", back_populates='infos', uselist=False)

    # gameplayer specific info
    ast_position:Mapped[int] = mapped_column(Integer, default=0)
    census:Mapped[int] = mapped_column(Integer, default=0)
    cities:Mapped[int] = mapped_column(Integer, default=0)
    credits:Mapped[dict] = mapped_column(JSON, default={'red':0, 'orange':0, 'yellow':0, 'green':0, 'blue':0})

    def __json__(self, flavor:str=None)->dict:
        if flavor == 'player': return {
            'id': self.id,
            'gameId': self.game_id,
            'host': self.game.host.username,
            'hostId': self.game.host_id,
            'turnNumber': self.game.turn_number,
        }
        if flavor == 'game': return {
            'id': self.id,
            'playerId': self.player_id,
            'username': self.player.username,
            'astPosition': self.ast_position,
            'cities': self.cities,
            'census': self.census,
            'credits': self.credits,
            'advancementCards': [json(card, 'game') for card in self.advancement_cards],
            'advancementCardsSelected': [json(card, 'game') for card in self.advancement_card_selected],
            **json(self.civilization)
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

