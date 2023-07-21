from sqlalchemy import create_engine, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session, backref
from config import protical, user, password, host, port, database
from typing import Any, Protocol, List
from assets import civs, advancement_cards, adv_colors
from exception import PlayerNotAutherizedError, GamePlayersNotReady, IvalidRequestError, GameInProgressError
from collections import Counter

# set to False for production
development = True

# url to connect to database
development_url = 'sqlite:///db.sqlite'
production_url = f'{protical}://{user}:{password}@{host}:{port}/{database}'
url = development_url if development else production_url
engine = create_engine(url)

def get_or_create(session:Session, Table:type, return_type=False, literal_only:bool=False, get_only=False, **conditions)->Any:
    # tuple that holds the target instance and the type literal/copy/new
    instance = None, None
    # if id is provided return the 'literal' instance (same id) if it exists
    if 'id' in conditions.keys(): instance = session.get(Table, conditions['id']), 'literal'
    if literal_only: return instance if return_type else instance[0]
    # else, return the 'copy' instance (all match all the conditions true) if it exists 
    else: instance = session.query(Table).filter_by(**conditions).first(), 'copy'
    if get_only: return instance if return_type else instance[0]
    # if no instance found, create the 'new' instance  
    if not all(instance): instance = Table(**conditions), 'new'; session.add(instance[0]); session.commit()
    return instance if return_type else instance[0]

# declare database schema
class Base(DeclarativeBase):
    ...

class Table(Protocol):

    def __json__(self, parent:str=None)->dict: ...

# returns a json-like dictionary version of instance
def json(table_instance:Table, parent:str=None)->dict:
    if table_instance is None: return None
    return table_instance.__json__(parent)

# advancement cards: holds info like name and price as well as card text
class AdvCard(Base):

    # creates or gets an adv card givin a dictionary definition
    def from_raw(session:Session, name:str=None, price:int=None, pgroup:str=None, credits:dict=None, texts:dict=None, sgroup:str=None, credit_to:dict=None)->'AdvCard':
        credit_to = get_or_create(session=session, Table=AdvCard.CreditTo, **credit_to) if credit_to else None
        print({**AdvCard.Credits.blank, **credits})
        credits = get_or_create(session=session, Table=AdvCard.Credits, **{**AdvCard.Credits.blank, **credits})
        card = get_or_create(session=session, Table=AdvCard, name=name, price=price, pgroup=pgroup, sgroup=sgroup, credit_to=credit_to, credits=credits, texts=texts)
        return card
    
    # get all cards
    def all(session:Session)->List['AdvCard']:
        return list(session.query(AdvCard).all())
    
    def create_all(session:Session, raw_cards:dict)->List['AdvCard']:
        return [AdvCard.from_raw(session=session, **card) for card in raw_cards]

    # sub table of adv card
    class CreditTo(Base):
        __tablename__ = 'creditto'
        id:Mapped[int] = mapped_column(primary_key=True)
        name:Mapped[str] = mapped_column(String)
        amount:Mapped[int] = mapped_column(Integer)

        def __json__(self, parent:str=None)->dict: data = {'name': self.name, 'amount': self.amount}; return data

        def __repr__(self)->str:return f'credit to {self.name} for {self.amount}'

    # sub table of adv card
    class Credits(Base):

        # used to initialize new credits
        blank = {'red': 0, 'blue': 0, 'green': 0, 'yellow': 0, 'orange': 0}

        __tablename__ = 'credits'
        # defines a credit
        id:Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
        red:Mapped[int] = mapped_column(Integer)
        blue:Mapped[int] = mapped_column(Integer)
        green:Mapped[int] = mapped_column(Integer)
        yellow:Mapped[int] = mapped_column(Integer)
        orange:Mapped[int] = mapped_column(Integer)

        def __json__(self, parent:str=None)->dict: 
            data = {
                'red': self.red,
                'blue': self.blue,
                'green': self.green,
                'yellow': self.yellow,
                'orange': self.orange
            }
            return data
        
        def __repr__(self)->str:return 'credits'

    __tablename__ = 'advcard'
    # card specific properties
    id:Mapped[int] = mapped_column(primary_key=True)
    name:Mapped[str] = mapped_column(String)
    price:Mapped[int] = mapped_column(Integer)
    pgroup:Mapped[str] = mapped_column(String)
    sgroup:Mapped[str] = mapped_column(String, nullable=True, default=None)
    credit_to_id:Mapped[int] = mapped_column(ForeignKey('creditto.id'), nullable=True)
    credit_to:Mapped[CreditTo] = relationship(CreditTo, backref=backref('card_from', uselist=False))
    credits_id:Mapped[int] = mapped_column(ForeignKey('credits.id'))
    credits:Mapped[Credits] = relationship(Credits, backref='card_from', uselist=False)
    texts:Mapped[str] = mapped_column(String)

    @property
    def points(self): return 1 if self.price < 100 else 3 if self.price < 200 else 6

    # players with the card
    players:Mapped[List['GamePlayer.AdvCards']] = relationship('AdvCards', back_populates='adv_card')
    players_selected:Mapped[List['GamePlayer.AdvCardsSelection']] = relationship('AdvCardsSelection', back_populates='adv_card')

    def __json__(self, parent:str=None)->dict:
        data = {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'pgroup': self.pgroup,
            'sgroup': self.sgroup,
            'creditTo': json(self.credit_to),
            'credits': json(self.credits),
            'texts': self.texts
        }
        if parent == 'all': return {'players': [json(player, 'card') for player in self.players], **data}
        return data

    def __repr__(self)->str:return self.name

# each instance represents a player's info for an individual game
class GamePlayer(Base):

    class AdvCards(Base):

        __tablename__ = 'advcards'
        # defines player/card combination
        id:Mapped[int] = mapped_column(Integer, primary_key=True)
        player_id:Mapped[int] = mapped_column(Integer, ForeignKey('gameplayer.id'))
        player:Mapped['GamePlayer'] = relationship('GamePlayer', back_populates='adv_cards', uselist=False)
        adv_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advcard.id'))
        adv_card:Mapped[AdvCard] = relationship(AdvCard, back_populates='players')

        def __json__(self, parent:str=None)->dict:
            if parent=='info': return json(self.adv_card)
            return (card:=json(self.player))
        
    class AdvCardsSelection(Base):

        __tablename__ = 'advcardsselection'
        # defines player/card combination
        id:Mapped[int] = mapped_column(Integer, primary_key=True)
        player_id:Mapped[int] = mapped_column(Integer, ForeignKey('gameplayer.id'))
        player:Mapped['GamePlayer'] = relationship('GamePlayer', back_populates='adv_cards_selection', uselist=False)
        adv_card_id:Mapped[int] = mapped_column(Integer, ForeignKey('advcard.id'))
        adv_card:Mapped[AdvCard] = relationship(AdvCard, back_populates='players_selected')

        def __json__(self, parent:str=None)->dict:
            if parent=='info': return json(self.adv_card)
            return (card:=json(self.player))

    __tablename__ = 'gameplayer'
    # unique instance for each game/player combo
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    player_info:Mapped['Player'] = relationship('Player', back_populates='game', uselist=False)
    game_id:Mapped[int] = mapped_column(Integer, ForeignKey('game.id'))
    game_info:Mapped['Game'] = relationship('Game', back_populates='players', uselist=False)
    # all the player's info for specific game
    civ:Mapped[str] = mapped_column(String, nullable=True)
    adv_cards:Mapped[List[AdvCards]] = relationship(AdvCards, back_populates='player', cascade='all, delete-orphan')
    adv_cards_selection:Mapped[List[AdvCardsSelection]] = relationship(AdvCardsSelection, back_populates='player', cascade='all, delete-orphan')
    ast_score:Mapped[int] = mapped_column(Integer, default=0)
    credits:Mapped[dict] = mapped_column(JSON, default={'blue':0, 'yellow':0, 'orange':0, 'green':0, 'red':0})
    # player state variables
    selection_ready:Mapped[bool] = mapped_column(Boolean, default=False)
    has_purchased:Mapped[bool] = mapped_column(Boolean, default=False)
    can_advance:Mapped[bool] = mapped_column(Boolean, default=True)

    # player properties
    @property
    def is_host(self): return self.player_info.hosted_game == self.game_info if self.player_info else None

    @property
    def score(self)->int:
        cards_score = sum(card.adv_card.points for card in self.adv_cards)
        ast_score = self.ast_score
        total_score = cards_score + ast_score
        return total_score
    @property
    def civ_info(self)->dict: return next(filter(lambda civ: civ['name']==self.civ, civs)) if self.civ else None
    @property
    def ast_order(self)->int: return self.civ_info['ast'] if self.civ_info else None
    @property
    def pcolor(self)->str: return self.civ_info['color'] if self.civ_info else None

    def remove(self, session:Session):
        self.player_info.game_id = None
        session.delete(self)
        session.commit()

    # dunder methods
    def __json__(self, parent:str=None)->dict:
        if parent=='info': return {
            'id': self.player_info.id,
            'username': self.player_info.username,
            'isHost': self.is_host,
            'advCards': [json(card, parent='info') for card in self.adv_cards],
            'advCardsSelection': [json(card, parent='info') for card in self.adv_cards_selection],
            'civ': self.civ,
            'color': self.pcolor,
            'astOrder': self.ast_order,
            'score': self.score,
            'hasPurchased': self.has_purchased,
            'canAdvance': self.can_advance,
            'selectionReady': self.selection_ready,
            'credits': self.credits

        }
        game = {
            'id': self.player_info.id if self.player_info else None,
            'username': self.player_info.username if self.player_info else None,
            'isHost': self.is_host,
            'advCards': [json(card, 'player') for card in self.adv_cards],
            'advCardsSelection': [json(card, 'parent') for card in self.adv_cards_selection],
            'civ': self.civ,
            'color': self.pcolor,
            'astOrder': self.ast_order,
            'score': self.score,
            'hasPurchased': self.has_purchased,
            'canAdvance': self.can_advance,
            'selectionReady': self.selection_ready
        }
        if parent=='game': return game
        return {**json(self.game_info), 'isHost':self.player_info.hosted_game == self.game_info} if self.game_info else None

    def __repr__(self) -> str: return f'{self.player_info}\'s info for {self.game_info}'

# player's info not related to a game
class Player(Base):

    # get all cards
    def all(session:Session, in_json:bool=False)->List['Player'] or List[dict]:
        if in_json: return [json(player, parent='all') for player in session.query(Player).all()]
        return list(session.query(Player).all())

    def login(session:Session, username:str, password:str)->'Player':
        player = session.query(Player).filter_by(username=username).first()
        if player and player.password == password: return player
        return None

    __tablename__ = 'player'
    # player's defining info
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    username:Mapped[str] = mapped_column(String)
    password:Mapped[str] = mapped_column(String)
    # game that player is hosting
    hosted_game_id:Mapped[int] = mapped_column(Integer, ForeignKey('game.id'), nullable=True)
    hosted_game:Mapped['Game'] = relationship('Game', back_populates='host', uselist=False)
    # game that player is currently playing
    game_id:Mapped[int] = mapped_column(Integer, ForeignKey('gameplayer.id'), nullable=True)
    game:Mapped[GamePlayer] = relationship(GamePlayer, back_populates='player_info', uselist=False)

    def leave_game(self, session:Session):
        if not self.game: return
        gameplayer:GamePlayer = self.game
        gameplayer.remove(session)
        return None
    
    def delete_game(self, session:Session):
        if (not self.game) or (not self.game.is_host): raise PlayerNotAutherizedError
        gameplayer:GamePlayer = self.game
        game:Game = gameplayer.game_info
        # gameplayer.remove(session)
        game.delete(session)
        return None

    # adds player to existing game
    def join_game(self, session:Session, data:dict)->'Game':
        if not 'gameId' in data.keys(): raise IvalidRequestError
        game:Game = get_or_create(session, Game, id=data['gameId'], literal_only=True)
        if game.turn_number: raise GameInProgressError
        if self.game: self.game.remove(session)
        playergame = GamePlayer(game_id=data['gameId'])
        self.game_id = playergame.id
        playergame.player_info = self
        session.add(playergame)
        session.commit()
        return game

    # creates new game with player as host and adds player to game
    def create_game(self, session:Session)->'Game':
        if self.hosted_game: return json(self.hosted_game) # already hosting game, return that
        # create game with player as host
        game:Game = Game(host=self)
        session.add(game)
        session.commit()
        # add player to game's players
        playergame = GamePlayer(game_id=game.id)
        self.game_id = playergame.id
        playergame.player_info = self
        session.add(playergame)
        session.commit()
        return game
    
    def select_card(self, session:Session, cardId):
        if any(card.adv_card_id==cardId for card in self.game.adv_cards): return False
        self.game.adv_cards_selection.append(GamePlayer.AdvCardsSelection(player_id=self.game.id, adv_card_id=cardId))
        session.add(self)
        session.commit()

    def deselect_card(self, session:Session, cardId):
        card = get_or_create(session, GamePlayer.AdvCardsSelection, adv_card_id=cardId, player_id=self.game.id, get_only=True)
        if not card: return False
        self.game.adv_cards_selection.remove(card)
        session.add(self)
        session.delete(card)
        session.commit()
        return True

    def add_cards(self, session:Session):
        session.add(self)
        for cardselected in self.game.adv_cards_selection:
            if any(cardselected.adv_card_id==card.adv_card_id for card in self.game.adv_cards): print(f'skipping {cardselected.adv_card}'); continue
            cardrel = GamePlayer.AdvCards(player_id=self.game.id, adv_card_id=cardselected.adv_card_id)
            self.game.adv_cards.append(cardrel)
            session.commit()
            card = cardrel.adv_card
            credits_on_card = Counter({'blue': card.credits.blue, 'yellow': card.credits.yellow, 'green': card.credits.green, 'red': card.credits.red, 'orange': card.credits.orange})
            self.game.credits = {'blue':0, 'yellow':0, 'orange':0, 'green':0, 'red':0, **{item: key for item, key in (credits_on_card + Counter(self.game.credits)).items()}}
            self.game.has_purchased = True
        self.game.adv_cards_selection = []
        session.commit()
        return True

    def remove_card(self, session:Session, cardId):
        session.add(self)
        adv_cards = [card for card in self.game.adv_cards if card.adv_card_id==cardId]
        adv_card = adv_cards[0] if adv_cards else None
        card:AdvCard = adv_card.adv_card
        credits_on_card = Counter({'blue': card.credits.blue, 'yellow': card.credits.yellow, 'green': card.credits.green, 'red': card.credits.red, 'orange': card.credits.orange})
        self.game.credits = {group: current_credit - credits_on_card[group] for group, current_credit in self.game.credits.items()}
        print({group: current_credit - credits_on_card[group] for group, current_credit in self.game.credits.items()})
        if adv_card: self.game.adv_cards.remove(adv_card)
        session.commit()
        return True
    
    def change_credits(self, session:Session, credits:dict):    
        self.game.credits =  credits #{group: credit+int(credits[group]) for group, credit in self.game.credits.items()}
        session.add(self)
        session.commit()

    def __json__(self, parent:str=None):
        if parent=='info': return {
            'id': self.id,
            'username': self.username,
            'gameId': self.game.game_id if self.game else None,
            'hostedGameId': self.hosted_game.id if self.hosted_game else None
        }
        if parent=='game': return {
            'id': self.id,
            'username': self.username,
        }
        return {
            'id': self.id,
            'username': self.username,
            'hostedGame': json(self.hosted_game),
            'gameId': self.game.game_info.id if self.game else None,
            'game': json(self.game, parent='player')
        }

    def __repr__(self) -> str: return f'{self.username}'

class Game(Base):

    __tablename__ = 'game'
    id:Mapped[int] = mapped_column(Integer, primary_key=True)
    host:Mapped[Player] = relationship(Player, back_populates='hosted_game', uselist=False)
    players:Mapped[List[GamePlayer]] = relationship(GamePlayer, cascade='all, delete-orphan', back_populates='game_info')
    turn_number:Mapped[int] = mapped_column(Integer, nullable=True)

    def start(self, session:Session, player:Player):
        if player.game.game_id != self.id: raise PlayerNotAutherizedError
        if not self.all_players_have_civ: raise GamePlayersNotReady
        self.turn_number = 1
        session.commit()

    def delete(self, session:Session):
        session.delete(self)
        session.commit()

    def end_turn(self, session:Session, data):
        for player in self.players:
            player.ast_score += 5 if player.can_advance else 0
            player.can_advance = True
            player.selection_ready = False
            player.has_purchased = False
        self.turn_number += 1
        session.commit()

    @property
    def all_players_have_civ(self)->bool:
        return all(bool(player.civ) for player in self.players)

    def __json__(self, parent:str=None):
        if parent=='info': return {
            'id': self.id,
            'hostId': self.host.id,
            'host': self.host.username,
            'players': [json(player, parent='info') for player in self.players],
            'turnNumber': self.turn_number
        }
        if parent == 'player': return {
            'id': self.id,
            'hostId': self.host.id
        }
        return {
            'id': self.id,
            'host': json(self.host, parent='game'),
            'players': [json(player, 'game') for player in self.players],
            'turnNumber': self.turn_number 
        }
    
    def __repr__(self) -> str: return f'{self.host}\'s game'


if __name__ == '__main__':
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        AdvCard.create_all(session, advancement_cards)
