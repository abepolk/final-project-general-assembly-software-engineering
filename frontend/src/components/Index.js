import React from 'react'
import {Redirect} from 'react-router-dom'

function Index(props) {

    const {fns, tasks} = props;
    const {logOut, createTask, removeTask} = fns;

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
            <h1 className="title">Never Forget Again</h1>
            <h3>Create new task</h3>
            <form onSubmit={(event) => {
                event.preventDefault();
                createTask(formData);
            }}>
                <input
                    type="text"
                    name="taskName"
                    onChange={handleChange}
                /><br/>
                <br/>
                <input className="submit" type="submit" value="Add task" />
            </form>\
            <ul className="task-container">
                {tasks.map((task, index) => {
                  return <li key={index} className={`task ${index % 2 ? 'odd' : 'even'}`}>{task.taskName}<button onClick={(event) => removeTask(task)}>Mark complete</button></li>  
                })}
            </ul>
        </>
    )
}

export default Index;