//Logout return a button that calls the logout function.
//When clicked, the button calls the logout function, which removes the token from local storage.
//The user is then redirected to the login page.

//Logout.js
import React from 'react';
// import useNavigate from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';


function Logout () {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };
    
    return (
        <div className="navbarLogout">
            <div onClick={logout} aria-label="Logout"><FontAwesomeIcon icon={faSignOut}/>
                <div className="navbarText">
                    Logout
                </div>
            </div>
        </div>
    );
    }

export default Logout;