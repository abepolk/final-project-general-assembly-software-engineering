import React from 'react'
import {Redirect, Link} from 'react-router-dom'

function LogIn(props) {


    const {logIn} = props;

    const [formData, setFormData] = React.useState('');

    const handleChange = (event) => {
                setFormData({ ...formData, [event.currentTarget.name]: event.currentTarget.value });
    };    

    if (props.loggedIn) {
        return <Redirect to="/" />
    }


    return (
        <>
            <h1>Log in</h1>
            <div className="loginContainer">
                <form onSubmit={(event) => {
                    event.preventDefault();
                    logIn(formData);
                }}>
                    <label>Username:</label> 
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    /><br/>
                    <label>Password:</label> 
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <br/>
                    <input className="submit" type="submit" value="Log In" />
                </form>
            </div>
            <Link to="create-user">Create new user</Link>
        </>
    )
}

export default LogIn;