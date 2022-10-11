const Footer = () => {
    const today = new Date();
    return (
        <footer className="footer">
            <p>© {today.getFullYear()} Groupomania</p>
        </footer>
    );
};

export default Footer;