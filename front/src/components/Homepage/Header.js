import Nav from './Nav';
import logo from '../../pictures/groupomania-logo-no-writing.jpg';
import white_logo_only from '../../pictures/icon-left-font-monochrome-white.svg';
// const [search, setSearch] = useState('');

const Header = ({title}) => {
    return (
        <header className="Header">
        <h1>{title}</h1>
        <img src={logo} className="logo" alt="logo-groupomania" />
        </header>
    );
};

export default Header;

//Get header out, navbar is enough.