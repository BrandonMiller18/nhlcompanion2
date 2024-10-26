import datetime

from flask import Blueprint, render_template, make_response
from nhlcompanion.models import Teams, Schedule
from sqlalchemy import or_, asc

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
    print(type(today))

    teams = Teams.query.all()
    team_schedule = Schedule.query.filter(or_(Schedule.home_team==team,
                                              Schedule.away_team==team)).order_by(asc(Schedule.date)).all()
    
    
    game_id = None
    if len(team_schedule) > 0:
        for game in team_schedule:
            game.date = datetime.datetime.strptime(game.date, format)
            print(type(game.date))
            if game.date == today:
                game_id = game.game_id
                


    # SET TEAM DATA VALUES IN COOKIES FOR EASY ACCESS
    res = make_response(render_template('app/test_team_page.html',
                           today = today,
                           teams = teams,
                           team_schedule = team_schedule,
                           team_abbreviation = team,
                           game_id = game_id if game_id else None
                           ))
    res.set_cookie('team', team)
    
    return res
