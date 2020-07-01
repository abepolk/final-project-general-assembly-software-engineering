import os
import boto3
import botocore
from hashlib import pbkdf2_hmac
import jwt
from flask import Flask, jsonify, request, abort, g
from functools import wraps

app = Flask(__name__)
USERS_TABLE = os.environ['USERS_TABLE']
client = boto3.client('dynamodb')


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'Authorization' not in request.headers:
            abort(403)
        auth = request.headers['Authorization']
        token = auth.split()[1]
        try:
            payload = jwt.decode(token, os.environ['SECRET'])
        except jwt.exceptions.InvalidTokenError:
            abort(403)
        g.user = payload
        return f(*args, **kwargs)
    return decorated_function


@app.route("/")
@login_required
def hello():
    return f"Hello {g.user['username']}!"


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

    if 'Item' not in resp:
        return jsonify({'error': 'User does not exist'}), 404
    item = resp['Item']

    salt = item['salt']
    db_key = item['key']
    req_key = pbkdf2_hmac('sha256', password.encode('utf-8'), salt['B'], 100000)

    if req_key != db_key['B']:
        return jsonify({'error': 'Incorrect password'}), 401
    else:
        token_bytes = jwt.encode({"username": username}, os.environ['SECRET'])
        token = token_bytes.decode('utf-8')
        return jsonify(token)


@app.route("/users/new", methods=["POST"])
def create_user():
    username = request.json.get('username')
    password = request.json.get('password')
    salt = os.urandom(32)  # A new salt for this user
    key = pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    if not username or not password:
        return jsonify({'error': 'Please provide username and password'}), 400
    try:
        resp = client.put_item(
            TableName=USERS_TABLE,
            Item={
                'username': {'S': username },
                'salt': {'B': salt },
                'key': {'B': key}
            },
            ConditionExpression='attribute_not_exists(username)'
        )
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return jsonify({'error': 'User already exists'})
        else:
            raise

    return jsonify({
         'username': username,
         'password': password
    })