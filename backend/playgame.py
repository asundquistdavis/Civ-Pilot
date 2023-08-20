from .db import DB
from .auth import get_player

from .models.GamePlayer import GamePlayer
from .models.Player import Player
from .models.Game import Game
from .exception import InvalidInput, GameNotFound

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

def get_all_games(db:DB):
    """gets all games and returns (host(username), id for each one)"""
    return [{'host': game.host.username, 'id': game.id} for game in db.query(Game).all()]
