# Never Forget Again - General Assembly Software Engineering Immersive Final Project

## Overview

The app is a to-do list that allows users to keep track of items to do. The app supports the creation of users and user authentication. Users can view, create, and delete only their own tasks.

## Technologies

The app is a full-stack web application written in React and Flask. The backend also used the Serverless Framework to connect directly to a DynamoDB hosted by AWS. JWT and the Python hashlib library were used for authentication. flask_cors was also used. As AWS does not support auto-increment, timestamp were used as IDs for tasks. The frontend used React Router for the index, login, and create new user pages. React state hooks and effect hooks were used to maintain state, and deletion of entries used optimistic updating. Deletion of tasks was immediately updated in state and then confirmed in a request to the backend. An error was thrown if they did not match. Incorrect authentication was also handled for not existing users and incorrect passwords, as well as empty authentication fields. All non-login pages contained redirects to the login page for not logged in state, and visa versa for login pages for already logged in users. The backend non-authentication routes also double-checked authentication. The frontend was hosted on Netlify and the backend was hosted on AWS.

## Link to app
https://master--gallant-hermann-47a94a.netlify.app