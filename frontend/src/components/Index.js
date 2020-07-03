import React from 'react'
import {Redirect} from 'react-router-dom'

function Index(props) {

    if (!props.loggedIn) {
        return <Redirect to="/login" />
    }

    const {tasks} = props;
    const {logOut} = tasks;
    return <button onClick={logOut}>Log out</button>
}

export default Index;