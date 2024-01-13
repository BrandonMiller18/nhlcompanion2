import os
from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__)

    if test_config is None:
        app.config.from_pyfile('../config.py')
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize Flask extensions here
    from .extensions import db
    db.init_app(app)

    # Initialize blueprints here
    from .blueprints import main, teams, watchgame
    app.register_blueprint(main.bp)
    app.register_blueprint(teams.bp)
    app.register_blueprint(watchgame.bp)
    
    return app