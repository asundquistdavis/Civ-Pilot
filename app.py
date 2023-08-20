from flask import Flask, render_template, jsonify, request
from db import Session, Player, engine, Game, get_or_create, AdvCard, GamePlayer
from auth import  validate_login, validate_register, authenticate_user, authorize_user, get_new_player, get_valid_player
from exception import AuthError, PlayerNotFoundError, PlayerNotAutherizedError
import os
from json import load

from backend.auth import get_player, get_token, create_player
from backend.playgame import add_game, get_all_games, host_game
from backend.db import DB, json, main
from backend.exception import AppError

civs = {}
with open('assets/civs.json', 'r') as civs_file:
    civs = load(civs_file)

production = bool('secret' in os.environ)

if not production:
    import config

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ['secret'] if production else config.secret

bundle = '\\static\\main.js'

@app.route('/v1.0')
def index_old():
    return render_template('index.html', bundle=bundle)

@app.route('/api/game', methods=['POST'])
def game():
    data:dict = request.json
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
            if not targetPlayer: raise PlayerNotFoundError
            if not ((targetPlayer.id == requestingPlayer.id) or (requestingPlayer.game.is_host)): raise PlayerNotAutherizedError
            if type=='civilization':
                targetPlayer.game.civ = data['civilization'] if data['civilization'] else None
                session.add(targetPlayer)
                session.commit()
            if type=='advCardSelect':
                if not targetPlayer.deselect_card(session, data['advCardId']): targetPlayer.select_card(session, data['advCardId'])
            if type=='advCardPurchase' and requestingPlayer.game.is_host: targetPlayer.add_cards(session)
            if type=='advCardRemove' and requestingPlayer.game.is_host: targetPlayer.remove_card(session, data['advCardId'])
            if type=='creditChange' and requestingPlayer.game.is_host: targetPlayer.change_credits(session, data['credits'])
            if type=='censusChange': targetPlayer.game.census = data['census']; session.add(targetPlayer); session.commit()
            if type=='citiesChange': targetPlayer.game.cities = data['cities']; session.add(targetPlayer); session.commit()
            if type=='scoreChange': targetPlayer.game.score_offset = targetPlayer.game.score_offset + data['score'] - targetPlayer.game.score; session.add(targetPlayer); session.commit(); print(targetPlayer.game.score_offset)
            if type=='playerAdvance': targetPlayer.game.can_advance = not targetPlayer.game.can_advance; session.add(targetPlayer); session.commit()
            if type=='endTurn' and requestingPlayer.game.is_host: requestingPlayer.game.game_info.end_turn(session, data)
            game:Game = requestingPlayer.game.game_info
            return jsonify({'game': json(game, parent='info')})           
    except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE
    
@app.route('/api/civilizations')
def get_civilizations():
    return jsonify(civs)

@app.route('/api/calamities')
def get_calamities():
    with open('assets/calamities.json') as calamities:
        return jsonify(load(calamities))

@app.route('/api/advcards')
def get_advcards():
    with Session(engine) as session:
        advcards = AdvCard.all(session)
        return jsonify({'advCards': [json(card) for card in advcards]})
    
@app.route('/api/rules')
def get_rules():
    with open('assets/rules.json') as rules:
        return jsonify(load(rules))
    
@app.route('/api/history', methods=['POST'])
def history():
    data:dict = request.json
    with Session(engine) as session:
        player:Player = get_valid_player(session, app.config['SECRET_KEY'], data)
        game:Game = player.game.game_info if player.game else None
        return jsonify({'history': json(game, parent='history')})

@app.route('/api/usernames')
def usernames():
    with Session(engine) as session:
        usernames = [{'username': player.username, 'hostedGameId': player.hosted_game_id} for player in session.query(Player).all()]
    return jsonify({'usernames': usernames})
    
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

@app.route('/')
def page_index():
    bundle = '\\static\\index.js'
    return render_template('index.html', bundle=bundle)

@app.route('/page/auth')
def page_auth():
    bundle = '\\static\\auth.js'
    return render_template('index.html', bundle=bundle)

@app.route('/page/play')
def page_play():
    bundle = '\\static\\playgame.js'
    return render_template('index.html', bundle=bundle)

@app.route('/api/public/token', methods=['POST'])
def api_token():
    data = request.json
    with DB() as db:
        if data['register']: create_player(db, data)
        try: token = get_token(db, data)
        except AppError as error: return jsonify(json(error))
        return jsonify({'token': token})

@app.route('/api/public/player', methods=['POST'])
def api_player():
    data = request.json
    with DB() as db:
        try: player = get_player(db, data)
        except AppError as error: return jsonify(json(error))

        return jsonify({'player': json(player)})
    
@app.route('/api/public/game/add', methods=['POST'])
def api_add_game():
    data:dict = request.json
    with DB() as db:
        try: player = add_game(db, data)
        except AppError as error: return (json(error))
        return jsonify({'player': json(player)})
    
@app.route('/api/public/game/host', methods=['POST'])
def api_host_game():
    data:dict = request.json
    with DB() as db:
        try: player = host_game(db, data)
        except AppError as error: return jsonify(json(error))
        return jsonify({'player': json(player)})
    
@app.route('/api/public/allgames')
def api_all_games():
    with DB() as db:
        try: games = get_all_games(db)
        except AppError as error: return jsonify(json(error))
        return jsonify({'games': games})

if __name__ == '__main__':
    main()
    app.run(debug=True)
