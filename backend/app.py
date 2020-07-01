import os
import boto3
from hashlib import pbkdf2_hmac
import jwt

from flask import Flask, jsonify, request
app = Flask(__name__)
USERS_TABLE = os.environ['USERS_TABLE']
client = boto3.client('dynamodb')

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/users", methods=["POST"])
def log_in():
    username = request.json.get('username')
    password = request.json.get('password')
    resp = client.get_item(
        TableName=USERS_TABLE,
        Key={
            'username': { 'S': username }
        }
    )
    item = resp['Item']
    if not item:
        return jsonify({'error': 'User does not exist'}), 404

    salt = item['salt']
    db_key = item['key']
    print(password)
    req_key = pbkdf2_hmac('sha256', password.encode('utf-8'), salt['B'], 100000)
    print(req_key)
    print(db_key['B'])

    if req_key != db_key['B']:
        return jsonify({'error': 'Incorrect password'}), 401
    else:
        token = jwt.encode(username, os.environ['SECRET'])
        return jsonify(token)

@app.route("/users/new", methods=["POST"])
def create_user():
    username = request.json.get('username')
    password = request.json.get('password')
    salt = os.urandom(32)  # A new salt for this user
    print(password)
    key = pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    print(key)
    if not username or not password:
        return jsonify({'error': 'Please provide username and name'}), 400
    resp = client.put_item(
        TableName=USERS_TABLE,
        Item={
            'username': {'S': username },
            'salt': {'B': salt },
            'key': {'B': key}
        }
    )

    return jsonify({
         'username': username,
         'password': password
    })