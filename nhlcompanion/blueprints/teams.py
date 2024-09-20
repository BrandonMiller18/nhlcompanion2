from datetime import date

from flask import Blueprint, render_template, make_response
from nhlcompanion.models import Teams, Schedule
from sqlalchemy import or_, and_

bp = Blueprint('teams', __name__, url_prefix='/start')

@bp.route('/')
def pick_team():

    teams = Teams.query.all()

    return render_template('app/pick-team.html',
                           teams = teams)

@bp.route('/<team>')
def team_page(team):
    today = date.today()

    teams = Teams.query.all()
    team_schedule = Schedule.query.filter(or_(Schedule.home_team==team,
                                              Schedule.away_team==team), and_(Schedule.date <= today)).all()
    
    if len(team_schedule) > 0:
        for game in team_schedule:
            if game.date == f'{today}':
                game_id = game.game_id
                break
            else:
                game_id = None
    else:
        game_id = None

    # SET TEAM DATA VALUES IN COOKIES FOR EASY ACCESS
    res = make_response(render_template('app/team_page.html',
                           teams = teams,
                           team_schedule = team_schedule,
                           team_abbreviation = team,
                           game_id = game_id if game_id else None
                           ))
    res.set_cookie('team', team)
    
    return res
