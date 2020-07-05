import React from 'react'
import {Redirect} from 'react-router-dom'

function Index(props) {

    const {fns, tasks} = props;
    const {logOut} = fns;

    if (!props.loggedIn) {
        return <Redirect to="/login" />
    }

    return (
        <>
            <button onClick={logOut}>Log out</button>
            <ul>
                {tasks.map((task) => {
                  return <li>{task.taskName}</li>  
                })}
            </ul>
        </>
    )
}

export default Index;