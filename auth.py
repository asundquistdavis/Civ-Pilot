from db import Player, Session, engine, json, get_or_create
from jwt import encode, decode
from exception import IncompleteInputError, PasswordDoesNotMatchError, UserNameTakenError, InvalidCredentialsError, NoSuchUserError, PlayerNotFoundError

def validate_register(data:'dict[str, str]')->'tuple[str, str, str]':
    username, password, password_repeat = None, None, None
    if not ('username' in data.keys() and 'password' in data.keys() and 'passwordRepeat' in data.keys()):
        raise IncompleteInputError
    username, password, password_repeat = data['username'].lower(), data['password'].lower(), data['passwordRepeat'].lower()
    if password != password_repeat: raise PasswordDoesNotMatchError
    with Session(engine) as session:
        players = session.query(Player).filter_by(username=username).all()
        if players and username in (usernames:=[player.username for player in players]): raise UserNameTakenError
    return username, password

def authorize_user(key:str, username:str, password:str)->dict:
    with Session(engine) as session:
        get_or_create(session, Player, username=username, password=password)
    return authenticate_user(key, username, password)

def validate_login(data:'dict[str, str]')->'tuple[str, str, str]':
    username, password = None, None
    if not ('username' in data.keys() and 'password' in data.keys()): raise IncompleteInputError
    username, password = data['username'].lower(), data['password'].lower()
    return username, password

def authenticate_user(key:str, username:str, password:str)->dict:
    with Session(engine) as session:
        if not session.query(Player).filter_by(username=username).first(): raise NoSuchUserError
        player:Player = Player.login(session, username, password)
        if not player: raise InvalidCredentialsError
    token = encode({'user_id': player.id}, key=key, algorithm="HS256")
    return {'token': token}

def get_new_player(session:Session, key:str, data:dict)->dict:
    if not 'token' in data.keys(): raise InvalidCredentialsError
    player_id = decode(jwt=data['token'], key=key, algorithms=["HS256"])['user_id']
    player:Player = get_or_create(session, Player, id=player_id, literal_only=True)
    if not player: raise InvalidCredentialsError
    return player 

def get_valid_player(session:Session, key:str, data:dict)->Player:
    if not ('token' in data.keys() and 'playerId' in data.keys()): raise InvalidCredentialsError
    player_id = decode(jwt=data['token'], key=key, algorithms=["HS256"])['user_id']
    if not (player_id == data['playerId']): raise InvalidCredentialsError
    player:Player = get_or_create(session, Player, id=player_id, literal_only=True)
    if not player: raise PlayerNotFoundError 
    return player
