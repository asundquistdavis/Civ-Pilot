from sqlalchemy.orm import Session
from jwt import encode, decode
from random import randint

from .exception import InvalidPassword, NoPlayer, PlayerExists, PasswordsDoNotMatch, InvalidToken, InvalidInput
from .db import DB
from .models.Player import Player

def get_token(db:DB, data:dict)->str:
    """returns token for valid username/password"""
    # check for password and username
    if not ('username' in data and 'password' in data): raise InvalidInput
    username, password = data['username'], data['password']
    # get db Player with corespounding username
    player = db.get_or_create(Player, create=False, username=username)
    # error if player does not exist
    if not player: raise NoPlayer
    # decode hashed password saved in db
    db_password = decode(player.password, db.key, ['HS256'])['password']
    # check if passwords are equivelent
    if db_password != password: raise InvalidPassword
    # otherwise, return token
    return encode({'id': player.id}, db.key, 'HS256')
    
def create_player(db:DB, data:dict)->None:
    """creates new player with valid username/passwords"""
    # check params in data
    if not ('username' in data and 'password' in data and 'passwordRepeat' in data): raise InvalidInput
    username, password, password_repeat = data['username'], data['password'], data['passwordRepeat']
    # check that username is unique
    if db.get_or_create(Player, create=False, username=username): raise PlayerExists
    # check passwords match
    if password != password_repeat: raise PasswordsDoNotMatch
    # hash password
    salt = randint(0, 100000000000000)
    db_password = encode({'password': password, 'salt': salt}, db.key, 'HS256')
    # create player instance
    player = Player(username=username, password=db_password); db.add(player); db.commit()

def get_player(db:DB, data:dict)->Player:
    """returns player for valid token"""
    # ckeck that token is provided
    if not 'token' in data: raise InvalidToken
    # decode token
    id = decode(data['token'], db.key, ['HS256'])['id']
    # get literal player
    player = db.get(Player, id)
    # check that player was returned
    if not player: raise InvalidToken
    return player
