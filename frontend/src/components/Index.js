import React from 'react'
import {Redirect} from 'react-router-dom'

function Index(props) {

    const {fns, tasks} = props;
    const {logOut, createTask} = fns;

    const [formData, setFormData] = React.useState('');

    const handleChange = (event) => {
                setFormData({ ...formData, [event.currentTarget.name]: event.currentTarget.value });
    };    


    if (!props.loggedIn) {
        return <Redirect to="/login" />
    }

    return (
        <>
            <button onClick={logOut}>Log out</button>
            <form onSubmit={(event) => {
                event.preventDefault();
                createTask(formData);
            }}>
                <label>Task:</label> 
                <input
                    type="text"
                    name="taskName"
                    onChange={handleChange}
                /><br/>
                <br/>
                <input className="submit" type="submit" value="Add new task" />
            </form>

            <ul>
                {tasks.map((task, index) => {
                  return <li key={index}>{task.taskName}</li>  
                })}
            </ul>
        </>
    )
}

export default Index;