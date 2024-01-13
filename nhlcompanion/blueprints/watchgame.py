import json

from flask import Blueprint, render_template, request
from nhlcompanion.models import Teams
import requests

bp = Blueprint('watchgame', __name__, url_prefix='/watch-game')

@bp.route('/<user_team>/<game_id>', methods=['GET', 'POST'])
def watchgame(user_team, game_id):

    if request.method == 'POST':
        stream_delay = request.form.get('stream-delay')

        r = requests.get(f'https://api-web.nhle.com/v1/gamecenter/{game_id}/boxscore')
        data = r.json()      


        return render_template('app/watchgame.html',
                               stream_delay = stream_delay,
                               game_id = game_id,
                               user_team = user_team,
                               home_team = data['homeTeam'],
                               away_team = data['awayTeam'],
                               venue = data['venue']['default'],
                               )
    else:
        return "Watch the fucking game"
    

@bp.route('/_update-score/<game_id>', methods=['POST'])
def update_score(game_id):
    """Route for AJAX request to get game data and update scores"""
            
    r = requests.get(f'https://api-web.nhle.com/v1/gamecenter/{game_id}/play-by-play')
    res = r.json()

    ## for testing only 
    # with open("C:/python_projects/nhlcompanion_db/test/game-pbp.json", 'r') as f:
    #     res = json.load(f)

    return res 