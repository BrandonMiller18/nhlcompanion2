import datetime

from flask import Blueprint, render_template, make_response
from nhlcompanion.models import Teams, Schedule
from sqlalchemy import or_, asc

bp = Blueprint('teams', __name__, url_prefix='/start')

@bp.route('/<team>')
def team_page(team):
    
    teams = Teams.query.all()
    
    team_abbrs = []
    for db_team in teams:
        team_abbrs.append(db_team.team_abbreviation)
        
    if team not in team_abbrs:
        return "404"
    
    format = "%Y-%m-%d"
    today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
    
    team_schedule = Schedule.query.filter(or_(Schedule.home_team==team,
                                              Schedule.away_team==team)).order_by(asc(Schedule.date)).all()

    game_id = None
    if len(team_schedule) > 0:
        for game in team_schedule:
            game.date = datetime.datetime.strptime(game.date, format)
            
            if game.date == today:
                game_id = game.game_id

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
