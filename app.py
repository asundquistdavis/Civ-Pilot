from flask import Flask, render_template, jsonify, request
from db import Session, Player, engine, Game, json, get_or_create, AdvCard
from config import secret_key
from auth import  validate_login, validate_register, authenticate_user, authorize_user, get_new_player, get_valid_player
from exception import AuthError, PlayerNotFoundError,PlayerNotAutherizedError
from assets import civs

app = Flask(__name__)
app.config['SECRET_KEY'] = secret_key

bundle = '\\static\\bundle.js'

@app.route('/home')
def index():
    return render_template('index.html', bundle=bundle)

@app.route('/api/setcivilization', methods=['POST'])
def set_civilizations():
    data:dict = request.json
    with Session(engine) as session: 
        try: requestingPlayer:Player = get_valid_player(session, app.config['SECRET_KEY'], data)
        except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE
        if not 'targetPlayerId' in data.keys(): return jsonify(PlayerNotFoundError().dict()), PlayerNotFoundError().STATUS_CODE
        targetPlayer:Player = get_or_create(session, Player, id=data['targetPlayerId'], literal_only=True)
        if not targetPlayer: return jsonify(PlayerNotFoundError().dict()), PlayerNotFoundError().STATUS_CODE
        if (targetPlayer.id == requestingPlayer.id) or (requestingPlayer.game.is_host and (targetPlayer.game.game_info.id == requestingPlayer.hosted_game.id)): 
            targetPlayer.game.civ = data['civilization'] if data['civilization'] else None
            session.add(targetPlayer)
            session.commit()
            return jsonify({'player': json(requestingPlayer)})
    return jsonify(PlayerNotAutherizedError().dict()), PlayerNotAutherizedError().STATUS_CODE

@app.route('/api/player', methods=['POST'])
def get_player():
    data:dict = request.json
    key = app.config['SECRET_KEY']
    try: 
        with Session(engine) as session: 
            player = get_new_player(session, key, data)
            return jsonify({'player': json(player, parent='info')})
    except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE

@app.route('/api/game', methods=['POST'])
def game():
    data:dict = request.json
    print(f'{data=}')
    key = app.config['SECRET_KEY']
    type = data['type'] # create, join, get, start, leave, delete
    try: 
        with Session(engine) as session:
            player:Player = get_valid_player(session, key, data)
            if type=='create': game:Game = player.create_game(session)
            elif type=='join': game:Game = player.join_game(session, data)
            elif not player.game: return jsonify({'message': 'game dne'}), 400
            else: game:Game = player.game.game_info
            if type=='start': game.start(session)
            if type=='leave': game:Game = player.leave_game(session)
            if type=='delete': game:Game = player.delete_game(session)
            return jsonify({'game': json(game, parent='info')})
    except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE

@app.route('/api/gameaction', methods=['POST'])
def game_action():
    data:dict = request.json
    key = app.config['SECRET_KEY']
    type = data['type'] # civilization, start, ...
    try:
        with Session(engine) as session:
            requestingPlayer:Player = get_valid_player(session, key, data)
            if type=='start':
                if not requestingPlayer.game: return ... # can't start game that does not exist
                if not requestingPlayer.game.is_host: return ... # cannot start game if not the host
                game:Game = requestingPlayer.game.game_info
                if not game.all_players_have_civ: return ... # every player must have a civ
                game.turn_number = 1
                session.commit()
                return jsonify({'game': json(game, parent='info')}) 
            targetPlayer:Player = get_or_create(session, Player, id=data['targetPlayerId'], literal_only=True)
            if type=='civilization':
                if not targetPlayer: raise PlayerNotFoundError
                if (targetPlayer.id == requestingPlayer.id) or (requestingPlayer.game.is_host and (targetPlayer.game.game_info.id == requestingPlayer.hosted_game.id)): 
                    targetPlayer.game.civ = data['civilization'] if data['civilization'] else None
                    session.add(targetPlayer)
                    session.commit()
                    game:Game = requestingPlayer.game.game_info
                    return jsonify({'game': json(game, parent='info')})
    except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE
    
@app.route('/api/civilizations')
def get_civilizations():
    return jsonify({'civilizations': civs})

@app.route('/api/advcards')
def get_advcards():
    with Session(engine) as session:
        advcards = AdvCard.all(session)
        return jsonify({'advCards': [json(card) for card in advcards]})

@app.route('/api/usernames')
def usernames():
    with Session(engine) as session:
        usernames = [{'username': player.username, 'hostedGameId': player.hosted_game_id} for player in session.query(Player).all()]
    return jsonify({'usernames': usernames})

@app.route('/api/create', methods = ['POST'])
def create_game():
    player_id = request.json['playerId']
    with Session(engine) as session:
        player:Player = session.get(Player, player_id)
        player.create_game(session)
        return jsonify({'player': json(player)})

@app.route('/api/join', methods = ['POST'])
def join_game():
    player_id, game_id = request.json['playerId'], request.json['gameId']
    with Session(engine) as session:
        player = session.get(Player, player_id)
        player.join_game(session, game_id)
        return jsonify({'player': json(player)})

@app.route('/api/leave', methods = ['POST'])
def leave_game():
    data:dict = request.json
    with Session(engine) as session:
        player:Player = get_valid_player(session, app.config['SECRET_KEY'], data)
        if not player.game: return jsonify({'player': json(player)}) # no game to leave
        player.leave_game(session)
        return jsonify({'player': json(player)})

@app.route('/api/delete', methods = ['POST'])
def delete_game():
    data:dict = request.json
    with Session(engine) as session:
        player:Player = get_valid_player(session, app.config['SECRET_KEY'], data)
        if not player.game: return jsonify({'player': json(player)})
        player.delete_game(session)
        return jsonify({'player': json(player)})

@app.route('/api/start', methods=['POST'])
def start_game():
    data:dict = request.json
    with Session(engine) as session:
        player:Player = get_valid_player(session, app.config['SECRET_KEY'], data)
        if not player.game: return ... # can't start game that does not exist
        if not player.game.is_host: return ... # cannot start game if not the host
        game:Game = player.game.game_info
        if not game.all_players_have_civ: return ... # every player must have a civ
        game.turn_number = 1
        session.commit()
        return jsonify({'player': json(player)})

@app.route('/api/players')
def players():
    with Session(engine) as session:
        return jsonify(Player.all(session, in_json=True))
    
@app.route('/api/status')
def player():
    data:dict = request.args
    with Session(engine) as session:
        if not 'token' in data.keys(): return jsonify({'message': 'invalid token'}), 401
        player:Player = get_player(session, app.config['SECRET_KEY'], data['token'])
        adv_cards = AdvCard.all(session, in_json=True)
        return jsonify({'player': json(player), 'civilizations': civs, 'advCards': adv_cards})

@app.route('/token', methods=['POST'])
def login():
    data:dict = request.json
    key = app.config['SECRET_KEY']
    register:bool = data['register']
    try:
        if register: username, password = validate_register(data); token = authorize_user(key, username, password)
        else: username, password = validate_login(data); token = authenticate_user(key, username, password)
    except AuthError as error: return (error.dict()), error.STATUS_CODE
    return jsonify(token)

# @app.route('/api/games')
# def game():
#     with Session(engine) as session:
#         print((game:=[json(game) for game in session.query(Game).all()]))
#         return jsonify(game)

if __name__ == '__main__':
    app.run(debug=True)
