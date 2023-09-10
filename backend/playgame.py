from typing import Tuple, List, Dict, Any, Iterable

from .db import DB
from .auth import get_player

from .models.GamePlayer import GamePlayer
from .models.Player import Player
from .models.Game import Game
from .models.Civilization import Civilization
from .exception import InvalidInput, GameNotFound, GamePlayerNotFound, CivilizationNotFound, PlayerNotAuthorized, CivilizationTaken

def host_game(db:DB, data):
    """adds a new game with player(token) as host"""
    # get player
    player = get_player(db, data)
    # if player is already hosting a game, delete it
    if player.hosted_game: db.delete(player.hosted_game); db.commit()
    # create new game with player as host
    game = Game(host_id=player.id)
    # add game to players hosted games
    player.hosted_game = game
    db.add(game); db.commit()
    print(game)
    # add new gameplayer info to player
    player.game_infos.append(GamePlayer(game_id=game.id, player_id=player.id))
    # save cahnges and return the player
    db.add(player)
    db.commit()
    return player

def add_game(db:DB, data:dict)->Player:
    """adds game to player"""
    # get player
    player = get_player(db, data)
    # check that gamId is in data
    if not ('token' in data and 'gameId' in data): raise InvalidInput
    game_id = data['gameId']
    # check that target game exists
    if not db.get(Game, game_id): raise GameNotFound
    # add new gameplayer info to player
    player.game_infos.append(GamePlayer(game_id=game_id, player_id=player.id))
    # save changes and return the player
    db.add(player)
    db.commit()
    return player

def get_all_games(db:DB)->List[Dict[str, Any]]:
    """gets all games and returns (host(username), id for each one)"""
    return [{'host': game.host.username, 'id': game.id} for game in db.query(Game).all()]

def get_game(db:DB, data:dict):
    """gets game with specified ID"""
    # check for gameId in data
    if not 'gameId' in data: raise InvalidInput 
    game:Game = db.get(Game, data['gameId'])
    return game

def get_civilizations(db:DB)->Iterable[Civilization]:
    return db.query(Civilization).all()

def set_civilization(db:DB, data:dict)->Game:
    """sets civilization of target gameplayer"""
    # get player
    _, info = get_authorized_player_for_gameplayer(db, data, True)
    # check that civilization is provided
    if not ('civilization' in data): raise InvalidInput
    # get civiliztion
    civilization = db.get_or_create(Civilization, create=False, name=data['civilization'])
    if not civilization: raise CivilizationNotFound
    # get game
    game:Game = info.game
    # check civilization is not already selected
    if any(_info.game_id==game.id for _info in civilization.infos): raise CivilizationTaken
    # set civilization
    info.civilization = civilization
    db.add(info); db.commit()
    # return game
    return game

def get_authorized_player_for_gameplayer(db:DB, data:dict, include_player:bool=True)->Tuple[Player, GamePlayer]:
    """gets player and checks they are host or the player associated with the gameplayer"""
    # get player
    player = get_player(db, data)
    # check info is provided
    if not 'infoId' in data: raise InvalidInput
    # check that info exists
    info = db.get(GamePlayer, data['infoId'])
    if not info: raise GamePlayerNotFound
    # check for host or gameinfo owned by player
    is_not_host = player.id != info.game.host_id
    is_not_player = player.id != info.player_id
    if is_not_host and (is_not_player if include_player else True): raise PlayerNotAuthorized
    # return player and gameplayer info
    return player, info

def get_authorized_player_for_game(db:DB, data:dict)->Tuple[Player, Game]:
    """gets player and checks that they are host"""
    # get player
    player = get_player(db, data)
    # check gameId is provided
    if not 'gameId' in data: raise InvalidInput
    # check that info exists
    game = db.get(Game, data['gameId'])
    if not game: raise GameNotFound
    if (is_not_host := player.id != game.host_id): raise PlayerNotAuthorized
    # return player and game
    return player, game
    
def get_game(db:DB, data:dict):
    """returns game of gameId"""
    # check for gameId
    if not 'gameId' in data: raise InvalidInput
    # check game exists/get game
    if not (game:=db.get(Game, data['gameId'])): raise GameNotFound
    return game

def start_game(db:DB, data:dict):
    # get player info and check they are host
    _, game = get_authorized_player_for_game(db, data)
    # set turnnumber to 1
    game.turn_number = 1; db.add(game); db.commit()
    return game

def leave_or_end_game(db:DB, data:dict):
    # get player game
    player = get_player(db, data)
    # get game
    game = get_game(db, data)
    # if player is host, delete game
    if (host_id:= game.host_id)==(player_id:=player.id): db.delete(game)
    # otherwise if player is in game remove their gp
    # delete game
    db.delete(game)
    return player
