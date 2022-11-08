import { Link } from 'react-router-dom';
import Logout from './Logout';
import { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFeather } from '@fortawesome/free-solid-svg-icons';
//Import house icon
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
//Import bell icon
import { faBell } from '@fortawesome/free-solid-svg-icons'; 
//Message icon
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
//Profile icon
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Nav = ({search, setSearch, posts, setPosts}) => {

    //Set state for window width
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    //useEffect to update window width
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize); //Add event listener to window
        return () => window.removeEventListener('resize', handleResize); //Remove event listener when component unmounts
    }, []);
   
    function handleRefresh() {
        if (window.location.pathname === '/'){
            //force update of the Home component
            setPosts([...posts]);
        }
    }
    return (
        <nav className = "Nav">
            <form className = "searchForm" onSubmit= {event => event.preventDefault()}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="searchIcon"/>
                   <div className="navbarText">
                    <label htmlFor="search"></label>
                    <input
                        id="search"
                        className="searchInput"
                        //On click, input gets bigger and the rest of the page gets more opaque.
                        onClick = {() => {
                            //If not mobile, we do not want the input to get bigger.
                            if (windowWidth <1024) {
                                document.getElementById("BlurEffect").style.display = "block";
                                document.querySelector(".Home").style.zIndex = "-1";
                                document.querySelector('.searchInput').style.width = "100vw";
                                document.querySelector('.searchInput').style.margin = "0 auto";
                                document.querySelector('.searchInput').style.borderRadius = "0";
                                document.querySelector('.searchInput').style.backgroundColor = "white";
                                document.querySelector('.searchInput').style.boxShadow = "0 0 10px 0 rgba(0, 0, 0, 0.2)";
                                document.querySelector('.searchInput').style.zIndex = "51";
                                document.querySelector('.searchInput').style.position = "absolute";
                                document.querySelector('.searchInput').style.top = "0";
                                document.querySelector('.searchInput').style.left = "0";
                                document.querySelector('.searchInput').style.right = "0";
                                document.querySelector('.searchInput').style.transition = "all 0.5s ease-in-out";
                            }
                        }}
                        onBlur = {() => {
                            //onBlur means that if the input is not focused anymore, we apply effects to the input.
                            // if (windowWidth <1024) {
                                //Remove the effects with unset values.
                                document.getElementById("BlurEffect").style.display = "none";
                                document.querySelector(".Home").style.zIndex = "0";
                                document.querySelector('.searchInput').style.width = "100%";
                                document.querySelector('.searchInput').style.margin = "2px";
                                document.querySelector('.searchInput').style.borderRadius = "unset";
                                document.querySelector('.searchInput').style.backgroundColor = "unset";
                                document.querySelector('.searchInput').style.boxShadow = "unset";
                                document.querySelector('.searchInput').style.zIndex = "unset";
                                document.querySelector('.searchInput').style.position = "unset";
                                document.querySelector('.searchInput').style.top = "unset";
                                document.querySelector('.searchInput').style.left = "unset";
                                document.querySelector('.searchInput').style.right = "unset";
                                document.querySelector('.searchInput').style.transition = "unset";

                            // }
                        }}
                        //If the user taps enter, the effect is the same as clicking outside the input.
                        onKeyPress = {event => {
                            //Make the input disappear if the user presses enter.
                            if (event.key === 'Enter') {
                                document.getElementById("BlurEffect").style.display = "none";
                                document.querySelector(".Home").style.zIndex = "0";
                                document.querySelector('.searchInput').style.width = "100%";
                                document.querySelector('.searchInput').style.margin = "2px";
                                document.querySelector('.searchInput').style.borderRadius = "unset";
                                document.querySelector('.searchInput').style.backgroundColor = "unset";
                                document.querySelector('.searchInput').style.boxShadow = "unset";
                                document.querySelector('.searchInput').style.zIndex = "unset";
                                document.querySelector('.searchInput').style.position = "unset";
                                document.querySelector('.searchInput').style.top = "unset";
                                document.querySelector('.searchInput').style.left = "unset";
                                document.querySelector('.searchInput').style.right = "unset";
                                document.querySelector('.searchInput').style.transition = "unset";
                            }
                        }}
                        type="text"
                        placeholder="Search Posts"
                        value={search}
                        onChange={event => {
                            setSearch(event.target.value)
                        }}
                    />
                </div>
            </form>
            <ul className = "navLinks">
                <li><Link to="/" className="navLink" onClick={handleRefresh}><FontAwesomeIcon icon={faHome} /><div className="navbarText">Home</div></Link></li>
                <li><Link to="/newpost" className='navLink'><FontAwesomeIcon icon={faFeather} /><div className="navbarText">New Post</div></Link></li>
                <li><Link to="/" className='navLink'><FontAwesomeIcon icon={faBell} /><div className="navbarText">Notifications</div></Link></li>
                <li><Link to="/" className='navLink'><FontAwesomeIcon icon={faEnvelope} /><div className="navbarText">Messages</div></Link></li>
                <li><Link to="/" className='navLink'><FontAwesomeIcon icon={faUser} /><div className="navbarText">Profile</div></Link></li>
                <li><Logout /></li>
            </ul>
        </nav>
    );
};

export default Nav;