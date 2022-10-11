//Logout return a button that calls the logout function.
//When clicked, the button calls the logout function, which removes the token from local storage.
//The user is then redirected to the login page.

//Logout.js
import React from 'react';
// import useNavigate from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


function Logout () {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };
    
    return (
        <div>
            <button onClick={logout}>Logout</button>
        </div>
    );
    }

export default Logout;