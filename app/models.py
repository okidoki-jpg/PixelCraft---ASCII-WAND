from app import db
from uuid import uuid4

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    firstName = db.Column(db.String(100), nullable=False)
    lastName = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    asciiImg = db.relationship('AsciiImg', backref='user', lazy=True)

    def __init__(self, firstName, lastName, email, password):
        self.id = str(uuid4())
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.password = password


class AsciiImg(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    img = db.Column(db.String(2000), nullable=False)
    ascci = db.Column(db.String(2000), nullable=False)
    resolution = db.Column(db.Integer, nullable=False)
    colour = db.Column(db.Boolean, nullable=False)
    highlights = db.Column(db.Integer, nullable=False)

    def __init__(self, user_id, img, ascci, resolution, colour, highlights):
        self.id = str(uuid4())
        self.user_id = user_id
        self.img = img
        self.ascci = ascci
        self.resolution = resolution
        self.colour = colour
        self.highlights = highlights
