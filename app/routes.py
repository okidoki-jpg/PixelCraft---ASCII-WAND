import os
from app import app, db
from config import unsplash_api_key as key, unsplash_base_url as url
from flask import render_template, url_for, session, request, jsonify
from app.models import User, AsciiImg
from flask_cors import CORS, cross_origin
import base64
import requests


CORS(app, resources={r'/*': {'origins': '*'}})

@app.route('/')
def index():
	if 'user' not in session:
		return render_template('login/login.html')
	images = AsciiImg.query.all()
	return render_template('desktop/desktop.html', user=session['user'], images=images)

@app.route('/check-login', methods=['GET'])
def checkLogin():
	if 'user' in session:
		print(session['user'])
		return jsonify({'loggedIn': True, 'user': session['user']})
	else:
		return jsonify({'loggedIn': False})

@app.route('/loginPage', methods=['GET'])
def loginOptions():
	return render_template('login/login.html')

@app.route("/check-email", methods=['POST'])
def checkEmail():

	data = request.get_json()
	email = data.get("email")


	# check db for email
	user = User.query.filter_by(email=email).first()
	if user:
		return jsonify({'available': False, "error" : "Email is already in use"})
	else:
		return jsonify({'available': True})


@app.route("/signup", methods=['POST'])
def signup():
	data = request.get_json()

	email = data.get('email')
	password = data.get('password')
	first = data.get('first')
	last = data.get('last')

	print("adding user")
	try:
		user = User(email=email, password=password, firstName=first, lastName=last)
		db.session.add(user)
		db.session.commit()
		print("User added")
		return login(email, password)
	except Exception as e:
		print("error", e)
		return jsonify({'success': False, "error" : str(e)})



@app.route("/login", methods=['POST'])
def login(*args):

	email = None
	
	if args:
		email, password = args
	else:
		data = request.get_json()
		if data.get('user') == 'guest':
			session['user'] = "guest"
			index()
			return jsonify({'success': True})
		else:
			email = data.get('email' )
			password = data.get('password')

	user = User.query.filter_by(email=email).first()
	if user:
		if user.password == password:
			session['user'] = user.firstName
			session['email'] = email
			index()
			return jsonify({'success': True})
		else:
			return jsonify({'success': False, "error" : "Bad Credentials"})
	else:
		return jsonify({'success': False, "error" : "Bad Credentials"})

@app.route("/api/random")
@cross_origin()
def random():
	try:
		print("hello random")
		response = requests.get(f'{url}?client_id={key}')

		response_json = response.json()
		image_url = response_json.get('urls').get('regular')
		img_name = response_json.get('id')
		print("url", image_url)
		url_data = requests.get(image_url)
		print(url_data, "url_data")
		#image_data = url_data.content
		#base64_image = base64.b64encode(image_data).decode('utf-8')
		return jsonify({'image': image_url, 'name': img_name})
	except Exception as e:
		return jsonify({'error': "Failed to retrieve random image."}), 500

@app.route("/save", methods=["POST"])
def save():
	data = request.form.to_dict()

	# image edit values
	res = data.get("res")
	bw = bool(data.get("bw"))
	highs = data.get("highs")
	image = request.files['image']
	asci = request.files['art']

	img = image.filename
	ascci = asci.filename

	# save directory
	user_id = User.query.filter_by(email=session['email']).first().id
	save_path = f'static/images/uploads/{user_id}'
	os.makedirs(f"app/{save_path}", exist_ok=True)


	# image URLs - used to display in front-end
	img_url = f'{save_path}/{img}'
	ascci_url = f'{save_path}/{ascci}'

	# image path - used in file management
	img_path = f'app/{img_url}'
	ascii_path = f'app/{ascci_url}'

	# save images on server
	image.save(img_path)
	asci.save(ascii_path)

	try:
		art = AsciiImg(user_id=user_id, img=img_url, ascci=ascci_url, resolution=res, colour=bw, highlights=highs)
		db.session.add(art)
		db.session.commit()
		return jsonify({"success" : True})
	except Exception as e:
		print("Error saving img:", e)
		return jsonify({"success" : False, "error" : "Failed to save image."})

@app.route("/delete", methods=["POST"])
def delete():
	image_ids = request.get_json()["ids"]

	try:
		for id_ in image_ids:
			art = AsciiImg.query.filter_by(id=id_).first()
			db.session.delete(art)
		db.session.commit()
		return jsonify({"success" : True})
	except Exception as e:
		print("Error deleting img:", e)
		return jsonify({"success" : False, "error" : "Failed to delete image."})

@app.route("/logout", methods=["GET"])
def logout():
	session.pop('user', None)
	index()
	return jsonify({"success": True})
