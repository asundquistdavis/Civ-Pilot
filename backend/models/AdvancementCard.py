from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Integer, Boolean, String, ForeignKey
from typing import Any, List

class Base(DeclarativeBase):...

class AdvancementCard(Base):
    """each entry is a unique advancement card re-useable across games"""

    __tablename__ = 'advancementcard'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    name:Mapped[str] = mapped_column(String)
    cost:Mapped[int] = mapped_column(Integer)
    pgroup:Mapped[str] = mapped_column(String)
    sgroup:Mapped[str] = mapped_column(String)
    cred:Mapped[int] = mapped_column(Integer)
    corange:Mapped[int] = mapped_column(Integer)
    cyellow:Mapped[int] = mapped_column(Integer)
    cgreen:Mapped[int] = mapped_column(Integer)
    cblue:Mapped[int] = mapped_column(Integer)
    text:Mapped[List['ACText']] = relationship('ACText', back_populates='advancement_card', uselist=False)
    credit_to_id:Mapped[int] = mapped_column(Integer, ForeignKey('advancementcard.id'), nullable=True)
    # credit_to:Mapped['AdvancementCard'] = relationship('AdvancemnetCard', back_populates='credit_from', uselist=False)
    # credit_from:Mapped['AdvancementCard'] = relationship('AdvancementCard', back_populates='credit_to', uselist=False)

    
    players_own:Mapped[List[Any]] = relationship('GPAdvancementCard', back_populates='advancement_card')

    players_selected:Mapped[List[Any]] = relationship('GPAdvancementCardSelection', back_populates='advancement_card')

    players_history:Mapped[List[Any]] = relationship('TPAdvancementCardHistory', back_populates='advancement_card')

    players_purchase:Mapped[List[Any]] = relationship('TPAdvancementCardPurchase', back_populates='advancement_card')

    class ACText(Base):

        __tablename__ = 'actext'
        id:Mapped[int] = mapped_column(Integer, primary_key=True)
        type:Mapped[str] = mapped_column(String)
        text:Mapped[str] = mapped_column(String)

        advancement_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advancementcard.id'))
        advancement_card:Mapped['AdvancementCard'] = relationship('AdvancementCard', back_populates='text', uselist=False)
