import Nav from './Nav';
import logo from '../../pictures/groupomania-logo-no-writing.jpg';
// import white_logo_only from '../../pictures/icon-left-font-monochrome-white.svg';
// import full_logo from '../../pictures/icon-left-font-monochrome-white.svg';
import full_logo from '../../pictures/icon-left-font.png';
import React, { useEffect, useState } from 'react';

const Header = ({title}) => {
    //Use state to change the logo when the user change window size.
    const [currentLogo, setLogo] = useState(false);
    const [windowSize, setWindowSize] = useState(window.innerWidth);
    //When the window size changes, we change the logo.
    useEffect(() => {
        function handleResize() {
            setWindowSize(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
        if (windowSize < 1024) {
            setLogo(logo);
        } else {
            setLogo(full_logo);
        }
    }, [windowSize]);


    return (
        <header className="Header">
            {currentLogo && <img src={currentLogo} alt="Groupomania logo" className="logo"/>}
            {/* Until currentLogo exist, we do not charge it to avoid an incoherent logo displaying. */}
        </header>
    );
};

export default Header;

//Get header out, navbar is enough.