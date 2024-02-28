# configure environnet with config from .env
import pymysql
from datetime import timedelta
from dotenv import dotenv_values

config = dotenv_values(".env")


# Config object
class Config:
	SECRET_KEY = config['SECRET_KEY']
	user = config['user']
	assword = config['password']
	host = config['host']
	database = config['database']
	SQLALCHEMY_DATABASE_URI = config["SQLALCHEMY_DATABASE_URI"]
	SQLALCHEMY_TRACK_MODIFICATIONS = config["SQLALCHEMY_TRACK_MODIFICATIONS"]
	permenant_session_lifetime = timedelta(days=5)

unsplash_api_key = config["unsplash_api_key"]
unsplash_base_url = config["unsplash_base_url"]
