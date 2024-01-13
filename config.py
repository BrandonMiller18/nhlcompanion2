import os
from dotenv import load_dotenv
load_dotenv()

TESTING = True

SECRET_KEY = os.getenv("SECRET_KEY")
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")