import json

from flask import Blueprint, render_template, flash, request, redirect, url_for, make_response
from nhlcompanion.models import Teams
import requests

bp = Blueprint('watchgame', __name__, url_prefix='/watch-game')

@bp.route('/<user_team>/<game_id>', methods=['GET'])
def watchgame(user_team, game_id):

    stream_delay = request.form.get('stream-delay')

    r = requests.get(f'https://api-web.nhle.com/v1/gamecenter/{game_id}/boxscore')
    data = r.json()
    
    if data['homeTeam']['abbrev'] == user_team:
        user_team_id = data['homeTeam']['id']
    else:
        user_team_id = data['awayTeam']['id']
    
    res = make_response(render_template('app/watchgame.html',
                            stream_delay = stream_delay,
                            game_id = game_id,
                            user_team = user_team,
                            home_team = data['homeTeam'],
                            away_team = data['awayTeam'],
                            venue = data['venue']['default'],
                        ))
    
    res.set_cookie('nhlc_homeTeamLogo', data['homeTeam']['logo'])
    res.set_cookie('nhlc_awayTeamLogo', data['awayTeam']['logo'])
    res.set_cookie('nhlc_homeTeamId', str(data['homeTeam']['id']))
    res.set_cookie('nhlc_awayTeamId', str(data['awayTeam']['id']))
    res.set_cookie('nhlc_userTeamId', str(user_team_id))

    return res
    

@bp.route('/_update-score/<game_id>', methods=['GET'])
def update_score(game_id):
    """Route for AJAX request to get game data and update scores"""
            
    r = requests.get(f'https://api-web.nhle.com/v1/gamecenter/{game_id}/play-by-play')
    res = r.json()

    return res 