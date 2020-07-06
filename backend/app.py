import os
from hashlib import pbkdf2_hmac
from time import time
from functools import wraps
# import logging

import boto3
import botocore

from flask import Flask, jsonify, request, abort, g
from flask_cors import CORS
import jwt

# logger = logging.getLogger('flask_cors')
# logger.setLevel(logging.DEBUG)
# logger.addHandler(logging.StreamHandler())

app = Flask(__name__)
# Add AWS backend to list below when you have it
CORS(app, origin=['http://localhost:3000', 'https://master--gallant-hermann-47a94a.netlify.app'])
# Should be able to use an env var set up by the flask wsgi aws plugin that tells you if you are running locally or on AWS, see docs for page that also talks about sls wgsi
client = boto3.client('dynamodb')

USERS_TABLE = os.environ['USERS_TABLE']
TASKS_TABLE = os.environ['TASKS_TABLE']

# Middleware for checking valid token

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'Authorization' not in request.headers:
            print('auth not present')
            abort(403)
        auth = request.headers['Authorization']
        token = auth.split()[1]
        try:
            payload = jwt.decode(token, os.environ['SECRET'])
        except jwt.exceptions.InvalidTokenError:
            print('invalid token')
            abort(403)
        g.user = payload
        return f(*args, **kwargs)
    return decorated_function

####### Create, Read, Delete routes

@app.route("/")
@login_required
def list_tasks():
    result = client.scan(
        TableName=TASKS_TABLE,
        FilterExpression="task_owner = :owner",
        ExpressionAttributeValues={
            ':owner': {'S': g.user['username']}
        }
    )
    items = result['Items']
    print(items) # IS OWNER BEING SVED?
    return jsonify({'tasks': [{"taskName": item['task_name']['S'], "taskOwner": item['task_owner']['S'], 'time': item['time']['N']} for item in items]})

@app.route("/", methods=["POST"])
@login_required
def create_task():
    current_time = str(time())
    result = client.put_item(
        TableName=TASKS_TABLE,
        Item={
            'time': {'N': current_time},
            'task_owner': {'S': g.user['username']},
            'task_name': {'S': request.json.get('taskName')}
        }
    )
    return jsonify({
        'time': current_time,
        'taskOwner': g.user['username'],
        'taskName': request.json.get('taskName')
    })

@app.route("/", methods=["DELETE"])
@login_required
def delete_task():
    result = client.delete_item(
        TableName=TASKS_TABLE,
        Key={"time": {'N': request.json.get("time")}},
        ReturnValues='ALL_OLD'
    )
    result_data = result['Attributes']
    deleted = {'time': result_data['time']['N'], 'taskName': result_data['task_name']['S'], 'taskOwner': result_data['task_owner']['S']}
    return jsonify(deleted)

######## Authentication routes

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
            return jsonify({'error': 'User already exists'}), 409
        else:
            raise
    return jsonify({
         'username': username,
         'password': password
    })