import { Link } from 'react-router-dom';

const Missing = () => {
    return (
        <main className='missing'>
            <h2>Page introuvable.</h2>
            <p>Quel dommage !</p>
            <p>
                <Link to='/'>Retour à l'accueil</Link>
            </p>
        </main>
    );
};

export default Missing;