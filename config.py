from datetime import timedelta
import pymysql
# configure environnet with config

class Config:
	SECRET_KEY = 'super-secret-key'
	user = 'okidoki'
	password = 'Jak3Th3D0g'
	host = 'localhost'
	database = 'pixel_craft'
	SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{user}:{password}@{host}/{database}"
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	permenant_session_lifetime = timedelta(days=5)

unsplash_api_key = "zMioZc_o9Ccid1pxf5zfd47xjz8KuTDJIoOFrSppePk"
unsplash_base_url = 'https://api.unsplash.com/photos/random'
