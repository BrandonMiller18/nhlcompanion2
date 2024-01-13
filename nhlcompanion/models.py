from .extensions import db

# create tables
class Teams(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True)
    team_city = db.Column(db.String(50))
    team_name = db.Column(db.String(50))
    team_abbreviation = db.Column(db.String(50), unique=True)
    logo = db.Column(db.String(100))
    conference = db.Column(db.String(50))
    division = db.Column(db.String(50))

    def __init__(self, team_city, team_name, team_abbreviation, logo, conference, division):
        self.team_city = team_city
        self.team_name = team_name
        self.team_abbreviation = team_abbreviation
        self.logo = logo
        self.conference = conference
        self.division = division

    def __repr__(self):
        return f"Team name:{self.team_name}"
    
class Standings(db.Model):
    __tablename__ = 'standings'

    id = db.Column(db.Integer, primary_key=True)
    team_abbreviation = db.Column(db.String(50), unique=True)
    wins = db.Column(db.Integer)
    losses = db.Column(db.Integer)
    ot_losses = db.Column(db.Integer)
    points = db.Column(db.Integer)
    point_percentage = db.Column(db.Float(10))
    regulation_ot_wins = db.Column(db.Integer) # ROW
    streak_code = db.Column(db.String(1))
    streak_count = db.Column(db.Integer)
    goals_for = db.Column(db.Integer)
    goals_against = db.Column(db.Integer)
    goal_differential = db.Column(db.Integer)


    def __init__(self, team_abbreviation, wins, losses, ot_losses, points,
                 point_percentage, regulation_ot_wins, streak_code, streak_count,
                 goals_for, goals_against, goal_differential):
        self.team_abbreviation = team_abbreviation
        self.wins = wins
        self.losses = losses
        self.ot_losses = ot_losses
        self.points = points
        self.point_percentage = point_percentage
        self.regulation_ot_wins = regulation_ot_wins
        self.streak_code = streak_code
        self.streak_count = streak_count
        self.goals_for = goals_for
        self.goals_against = goals_against
        self.goal_differential = goal_differential


    def __repr__(self):
        return f"{self.team_abbreviation} has {self.points} points!"
    

class Schedule(db.Model):
    __tablename__ = 'schedule'

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, unique=True)
    date = db.Column(db.String(15))
    home_team = db.Column(db.String(50))
    away_team = db.Column(db.String(50))
    game_time = db.Column(db.String(50))
    venue = db.Column(db.String(50))
    tickets_link = db.Column(db.String(255))
    event = db.Column(db.String(255))


    def __init__(self, game_id, date, home_team,
                  away_team, game_time, venue, tickets_link, event):
        self.game_id = game_id
        self.date = date
        self.home_team = home_team
        self.away_team = away_team
        self.game_time = game_time
        self.venue = venue
        self.tickets_link = tickets_link
        self.event = event

    def __repr__(self):
        return f"{self.home_team} plays at {self.away_team} on {self.date}!"