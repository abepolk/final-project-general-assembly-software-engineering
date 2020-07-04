import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Switch, Route} from 'react-router-dom'
import LogIn from './components/LogIn.js'
import Index from './components/Index.js'

function App(props) {
  
  const baseUrl = process.env.NODE_ENV === 'production'
  ? '' // AWS backend URL goes here
  : 'http://localhost:5000';

  // No token means not logged in 
  const [token, setToken] = React.useState(window.localStorage.getItem('token') || '');

  const logIn = async (credentials) => {
    console.log('lgin called')
    const response = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {"Content-Type": "application/json"}
    });
    if (response.status === 200) {
      const token = await response.json();
      setToken(token);
      window.localStorage.setItem('token', JSON.stringify(token));
      props.history.push('/');
    } else if (response.status === 404) {
      //ignoring JSON for now
      alert('The username provided does not have an account.');
    } else if (response.status === 401) {
      alert('Incorrect password');
    } else {
      throw response.status
    }
  };

  const logOut = () => {
    setToken('')
    window.localStorage.removeItem('token');
  }

  const fns = {
    logOut
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Scrooll down for login button
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <Switch>
        <Route path="/login" component={(props) => <LogIn {...props} loggedIn={Boolean(token)} logIn={logIn} />} />
        <Route path="/" component={(props) => <Index {...props} loggedIn={Boolean(token)} fns={fns} />} />
      </Switch>
    </div>
  );
}

export default App;