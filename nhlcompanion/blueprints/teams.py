import datetime

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
    format = "%Y-%m-%d"
    today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())

    teams = Teams.query.all()
    team_schedule = Schedule.query.filter(or_(Schedule.home_team==team,
                                              Schedule.away_team==team), and_(Schedule.date <= today)).all()
    
    if len(team_schedule) > 0:
        for game in team_schedule:
            
            game.date = datetime.datetime.strptime(game.date, format)
            if game.date == today:
                game_id = game.game_id
                # game.date = datetime_obj.strftime(format)
                break
            else:
                # game.date = datetime_obj.strftime(format)
                game_id = None
    else:
        game_id = None

    # SET TEAM DATA VALUES IN COOKIES FOR EASY ACCESS
    res = make_response(render_template('app/team_page.html',
                           today = today,
                           teams = teams,
                           team_schedule = team_schedule,
                           team_abbreviation = team,
                           game_id = game_id if game_id else None
                           ))
    res.set_cookie('team', team)
    
    return res
