import React from 'react'
import {Redirect} from 'react-router-dom'

function NewUser(props) {


    const {createUser} = props;

    const [formData, setFormData] = React.useState('');

    const handleChange = (event) => {
        setFormData({ ...formData, [event.currentTarget.name]: event.currentTarget.value });
    };    

    if (props.loggedIn) {
        return <Redirect to="/" />
    }


    return (
        <>
            <h1>Create new user</h1>
            <div className="createNewUserContainer">
                <form onSubmit={(event) => {
                    event.preventDefault();
                    createUser(formData);
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
                    <input className="submit" type="submit" value="Create new user" />
                </form>
            </div>
        </>
    )
}

export default NewUser;