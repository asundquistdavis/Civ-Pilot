from flask import Flask, render_template, jsonify, request
from db import Session, Player, engine, Game, json, get_or_create, AdvCard, TradeCard, TradeCardPlayer, TradeCardPurchase
from auth import  validate_login, validate_register, authenticate_user, authorize_user, get_new_player, get_valid_player
from exception import AuthError, PlayerNotFoundError, PlayerNotAutherizedError
from itertools import product
import os
from json import load

civs = {}
with open('assets/civs.json', 'r') as civs_file:
    civs = load(civs_file)

production = bool('secret' in os.environ)

if not production:
    import config

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ['secret'] if production else config.secret

bundle = '\\static\\bundle.js'

@app.route('/')
def index():
    return render_template('index.html', bundle=bundle)

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
    key = app.config['SECRET_KEY']
    type = data['type'] # create, join, get, start, leave, delete
    try: 
        with Session(engine) as session:
            player:Player = get_valid_player(session, key, data)
            if type=='create': game:Game = player.create_game(session)
            elif type=='join': game:Game = player.join_game(session, data)
            elif not player.game: return jsonify({'message': 'game dne'}), 400
            else: game:Game = player.game.game_info
            # if type=='start': game.start(session)
            if type=='leave': game:Game = player.leave_game(session)
            if type=='delete': game:Game = player.delete_game(session)
            # print(dir(game))
            return jsonify({'game': json(game, parent=player.id)})
    except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE

@app.route('/api/gameaction', methods=['POST'])
def game_action(): 
    data:dict = request.json
    key = app.config['SECRET_KEY']
    type = data['type'] # civilization, start, ...
    try:
        with Session(engine) as session:
            requestingPlayer:Player = get_valid_player(session, key, data)
            print(type)
            if type=='start':
                if not requestingPlayer.game: return ... # can't start game that does not exist
                if not requestingPlayer.game.is_host: return ... # cannot start game if not the host
                game:Game = requestingPlayer.game.game_info
                if not game.all_players_have_civ: return ... # every player must have a civ
                TradeCardPlayer.build_trade_card_instances(session, game.id)
                game.shuffle()
                game.turn_number = 1
                session.commit()
                return jsonify({'game': json(game, parent=requestingPlayer.id)})
            if type=='startTrade':
                game:Game = requestingPlayer.game.game_info
                game.trading = True
                game.deal(session)
                # print([player.trade_cards for player in game.players])
                # print(game.decks)
                session.commit()
                return jsonify({'game': json(game, parent=requestingPlayer.id)})
            if type=='endTrade':
                game:Game = requestingPlayer.game.game_info
                game.trading = False
                return jsonify({'game': json(game, parent=requestingPlayer.id)})
            if type=='addTradeCard':
                game:Game = requestingPlayer.game.game_info
                deck_id = data['deckId']
                requestingPlayer.game.add_trade_card(session, deck_id)
                return jsonify({'game': json(game, parent=requestingPlayer.id)})
            if type=='removeTradeCard':
                game:Game = requestingPlayer.game.game_info
                purchase_id = data['purchaseId']
                purchase:TradeCardPurchase = get_or_create(session, TradeCardPurchase, id=purchase_id, get_only=True)
                if (purchase.player_id==requestingPlayer.id) or requestingPlayer.game.is_host: session.delete(purchase)
                session.commit()
                return jsonify({'game': json(game, parent=requestingPlayer.id)})
            if type=='addTradeCardTransaction':
                game:Game = requestingPlayer.game.game_info
                card:TradeCardPlayer = get_or_create(session, TradeCardPlayer, id=data['cardId'])
                target_id = data['targetPlayerId']
                status = card.add_transaction(session, target_id)
                session.add(status, game)
                session.commit()
                print(json(card))
                print(json(game, parent=requestingPlayer.id))
                return jsonify({'game': json(game, parent=requestingPlayer.id)})
            targetPlayer:Player = get_or_create(session, Player, id=data['targetPlayerId'], literal_only=True)
            if not targetPlayer: raise PlayerNotFoundError
            if not ((targetPlayer.id == requestingPlayer.id) or (requestingPlayer.game.is_host)): raise PlayerNotAutherizedError
            if type=='civilization':
                targetPlayer.game.civ = data['civilization'] if data['civilization'] else None
                session.add(targetPlayer)
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
            return jsonify({'game': json(game, parent=requestingPlayer.id)})           
    except AuthError as error: return jsonify(error.dict()), error.STATUS_CODE
    
@app.route('/api/civilizations')
def get_civilizations():
    return jsonify(civs)

@app.route('/api/calamities')
def get_calamities():
    with open('assets/calamities.json') as calamities:
        return jsonify(load(calamities))
    
@app.route('/api/tradecards')
def get_tradecards():
    with Session(engine) as session:
        tradecards = TradeCard.all(session)
        return jsonify({'tradeCards': [json(card) for card in tradecards]})

@app.route('/api/advcards')
def get_advcards():
    with Session(engine) as session:
        advcards = AdvCard.all(session)
        return jsonify({'advCards': [json(card) for card in advcards]})
    
@app.route('/api/rules')
def get_rules():
    with open('assets/rules.json') as rules:
        return jsonify(load(rules))

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

if __name__ == '__main__':
    app.run(debug=True)
