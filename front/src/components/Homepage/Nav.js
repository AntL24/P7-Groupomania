import { Link } from 'react-router-dom';
import Logout from './Logout';

const Nav = ({search, setSearch}) => {
    return (
        <nav className = "Nav">
            <form className = "searchForm" onSubmit= {event => event.preventDefault()}>
                <label htmlFor="search">Search Posts</label>
                <input
                    id="search"
                    type="text"
                    placeholder="Search Posts"
                    value={search}
                    onChange={event => {
                        setSearch(event.target.value)
                    }}
                />
            </form>
            <ul className = "navLinks">
                <li><Link to="/" className="navLink">Home</Link></li>
                <li><Link to="/newpost" className='navLink'>New Post</Link></li>
                <li><Logout /></li>
            </ul>
        </nav>
    );
};

export default Nav;