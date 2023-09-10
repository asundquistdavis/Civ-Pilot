from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from .models.Game import Game, Turn
from .models.Player import Player
from .models.GamePlayer import GamePlayer, GPAdvancementCard, GPAdvancementCardSelection
from .models.TurnPlayer import TurnPlayer, TPAdvancementCardHistory, TPAdvancementCardPurchase
from .models.Calamity import Calamity, Occurance
from .models.Civilization import Civilization
from .models.AdvancementCard import Base

class Table:
    def __json__(self, flavor=None):
        ...

def json(table_instance:Table, flavor:str=None):
    if table_instance == None: return None
    return table_instance.__json__(flavor)

class DB(Session):

    key = 'ASDFHjakfjfklfnhgahDFhkadfjHfdklHdfhFDh$#Yr364YRTHFhw$U4yTh$yy5treywGFDWHTW&^w%656wYHthsGWYrtu6Hgs'
    engine = create_engine('sqlite:///db.sqlite')

    def get_or_create(self, Table, create=True, **conditions):
        if (match := self.query(Table).filter_by(**conditions).first()): return match
        if create: new = Table(**conditions); self.add(new); self.commit(); return new
        return None

    def __init__(self):
        super().__init__(bind=DB.engine)

def main():
    engine = DB.engine
    Base.metadata.create_all(engine)
