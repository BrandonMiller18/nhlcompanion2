from datetime import date
from flask import Blueprint, request, render_template, make_response
from sqlalchemy import desc, asc
from nhlcompanion.models import Teams, Schedule, Standings

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    todays_date = date.today()
    
    teams = Teams.query.all()
    todays_schedule = Schedule.query.filter_by(date=f'{todays_date}').all()
    standings = Standings.query.order_by(desc(Standings.points))

    divisions = {}

    for team in teams:
        divisions[team.division] = team.conference
    
    # Get east and west conferences out of divisions dictionary and dedupe the list
    x = list(divisions.values())
    conferences = []
    [conferences.append(y) for y in x if y not in conferences]

    return render_template('index.html',
                           teams = teams,
                           todays_schedule = todays_schedule,
                           standings = standings,
                           divisions = divisions,
                           conferences = conferences)
    
@bp.route('/sitemap.xml')
@bp.route('/robots.txt')
def sitemap():
    file = request.path[1:]
    response= make_response(render_template(file))
    if file == 'sitemap.xml':
        response.headers['Content-Type'] = 'application/xml'
    else:
        response.headers['Content-Type'] = 'text/plain'
    return response