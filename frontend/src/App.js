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

  // Should only be called to initialize state and checkTasksAgainstBackend, because tasks will otherwise be updated by changing state directly
  const apiGetTasks = async () => {
    try {
      const response = await fetch (baseUrl, {
        headers: {
            Authorization: `JWT ${token}`
        }
      });
      if (response.status !== 200) {
        console.error(response)
      } else {
        const result = await response.json();
        return result.tasks;
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [tasks, setTasks] = React.useState([])
  // No token means not logged in 
  const [token, setToken] = React.useState(window.localStorage.getItem('token') || '');

  // If React is waiting for this method to complete for some reasons there will be problems
  const checkTasksAgainstBackend = async (tasksToCheck) => {
    const result = apiGetTasks();
    // Check "equality" of result and tasks to check, looking at stackoverflow
    const arr1 = result.sort()
    // Do not modify state directly
    const arr2 = [...tasksToCheck].sort()
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  const createTask = async (data) => {
    setTasks([...tasks, data])
    props.history.push('/')
    const response = await fetch (`${baseUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `JSON ${token}`
      },
      body: JSON.stringify(data),
    });
    const result = await response.json()
    for (const key in data) {
      if (data[key] !== result[key]) {
        throw new Error("Backend object not the same")
      }
    }
    // Should the arg be [...tasks, data]?
    if (!checkTasksAgainstBackend(tasks)) {
      throw new Error("Check for all tasks failed")
    }
  };
// Test once you're done with this

  // Initializes tasks after login
  React.useEffect(() => {
    const effect = async () => {
      if (token) {
        setTasks(await apiGetTasks());
      }
    }
    effect()
  }, [token]);

  const logIn = async (credentials) => {
    const response = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {"Content-Type": "application/json"}
    });
    if (response.status === 200) {
      const token = await response.json();
      setToken(token);
      window.localStorage.setItem('token', token);
      props.history.push('/');
    } else if (response.status === 404) {
      //ignoring JSON for now
      alert('The username provided does not have an account.');
    } else if (response.status === 401) {
      alert('Incorrect password');
    } else {
      throw response.status;
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
      <Switch>
        <Route path="/login" component={(props) => <LogIn {...props} loggedIn={Boolean(token)} logIn={logIn} />} />
        <Route path="/" component={(props) => <Index {...props} loggedIn={Boolean(token)} fns={fns} tasks={tasks}/>} />
      </Switch>
    </div>
  );
}

export default App;