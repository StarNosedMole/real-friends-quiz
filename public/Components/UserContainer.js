import React from 'react';
import User from './User.js';

const UserContainer = (props) => {

        const users = [];

        for (let i = 0; i < props.users.length; i++){
            users.push(<User username={props.users[i].id} id={props.users[i].id}/>)
        }
        
        return(
            <div>
                {users};
            </div>
        );
}

export default UserContainer;