from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

from .TurnPlayer import TurnPlayer
from .AdvancementCard import Base

class Calamity(Base):
    """each entry represeents a specific calamity"""

    # unique attrs
    __tablename__ = 'calamity'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    # related turnplayer
    occurances:Mapped[List] = relationship('Occurance', back_populates='calamity')

class Occurance(Base):

    # unique attrs
    __tablename__ = 'occurance'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)

    # related calamity
    calamity_id:Mapped[int] = mapped_column(Integer, ForeignKey('calamity.id'))
    calamity:Mapped['Calamity'] = relationship('Calamity', back_populates='occurances', uselist=False)
    
    # related turnplayer
    info_id:Mapped[int] = mapped_column(Integer, ForeignKey('turnplayer.id'))
    info:Mapped[TurnPlayer] = relationship('TurnPlayer', back_populates='calamities', uselist=False)
