from flask import Flask, render_template, jsonify, request
import os
from json import load

from backend.auth import get_player, get_token, create_player
from backend.playgame import add_game, get_all_games, host_game, get_game, get_civilizations, set_civilization, start_game, leave_or_end_game
from backend.db import DB, json, main
from backend.exception import AppError

production = bool('secret' in os.environ)

app = Flask(__name__)

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
        except AppError as error: return json(error)
        return jsonify({'token': token})

@app.route('/api/public/player', methods=['POST'])
def api_player():
    data = request.json
    with DB() as db:
        try: player = get_player(db, data)
        except AppError as error: return json(error)
        return jsonify({'player': json(player)})
    
@app.route('/api/public/civilizations')
def api_get_civilizations():
    with DB() as db:
        try: return jsonify({'civilizations': [json(civilization) for civilization in get_civilizations(db)]})
        except AppError as error: return json(error)
    
@app.route('/api/public/game/add', methods=['POST'])
def api_add_game():
    data:dict = request.json
    with DB() as db:
        try: player = add_game(db, data)
        except AppError as error: return json(error)
        return jsonify({'player': json(player)})
    
@app.route('/api/public/game/host', methods=['POST'])
def api_host_game():
    data:dict = request.json
    with DB() as db:
        try: player = host_game(db, data)
        except AppError as error: return json(error)
        return jsonify({'player': json(player)})
    
@app.route('/api/public/game/get', methods=['POST'])
def api_get_game():
    data:dict = request.json
    with DB() as db:
        try: game = get_game(db, data)
        except AppError as error: return json(error)
        return jsonify({'game': json(game)})
    
@app.route('/api/public/allgames')
def api_all_games():
    with DB() as db:
        try: games = get_all_games(db)
        except AppError as error: return json(error)
        return jsonify({'games': games})
    
@app.route("/api/public/civilization/set", methods=['POST'])
def api_set_civilization():
    data:dict = request.json
    with DB() as db:
        try: game = set_civilization(db, data)
        except AppError as error: return json(error)
        return jsonify({'game': json(game)})
    
@app.route('/api/public/game/start', methods=['POST'])
def api_start_game():
    data:dict = request.json
    with DB() as db:
        try: game = start_game(db, data)
        except AppError as error: return json(error)
        return jsonify({'game': json(game)})
    
@app.route('/api/public/game/leave', methods=['POST'])
def api_leave_game():
    data:dict = request.json
    with DB() as db:
        try: player = leave_or_end_game(db, data)
        except AppError as error: return json(error)
        return jsonify({'player': json(player)})

if __name__ == '__main__':
    main()
    app.run(debug=True)
