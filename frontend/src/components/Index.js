import React from 'react'
import {Redirect} from 'react-router-dom'

function Index(props) {

    if (!props.loggedIn) {
        return <Redirect to="/login" />
    }

    const {fns} = props;
    const {logOut} = fns;
    return <button onClick={logOut}>Log out</button>
}

export default Index;