import React from 'react'
import {Redirect} from 'react-router-dom'

function LogIn(props) {

    if (props.loggedIn) {
        return <Redirect to="/" />
    }

    const {logIn} = props;
    return (
        <button onClick={(e) => logIn({
            username: "test",
            password: "test"
        })}>Log in test</button>
    )
}

export default LogIn;