//Import logo 'icon-left-font-monochrome-black.svg' from 'pictures' folder in 'src' folder
import logo from '../../pictures/groupomania-logo-no-writing.jpg';
import white_logo_only from '../../pictures/icon-left-font-monochrome-white.svg';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
//Login and register page using React, react router and axio
//The routes to call the API are: localhost:5000/api/auth/login and localhost:5000/api/auth/register
//If an error occurs, wether it is a server error or a database error, the error will be displayed on the page in red.
//Error messages should be reset when user changes input field.

const emailValidator = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const passwordValidator = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(String(password));
}

const nameValidator = (name) => {
  //Two words, at least 3 characters each.
  const re = /^[a-zA-Z]{3,}\s[a-zA-Z]{3,}$/;
  return re.test(String(name));
}

//Modify AuthPage so that if authentification is successful, the user is redirected to the homepage, and the token is stored in local storage.

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const switchModeHandler = () => {
        if (!isLogin) {
            setName('');
        }
        setError(null);
        setIsLogin(prevMode => !prevMode);
    };

    const submitHandler = async event => {
        event.preventDefault();
        if (isLogin) {
            if (!emailValidator(email)) {
                setError('Invalid email');
                return;
            }
            if (!passwordValidator(password)) {
                setError('Invalid password');
                return;
            }
            try {
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email: email,
                    password: password
                });

                if (response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                const resData = await response.data;
                console.log(resData);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                console.log(resData);
                //useNavigate to redirect to "/" does not work. I don't know why.
                window.location.reload();
            } catch (err) {
                console.log(err);
                setError(err.response.data.message);
            }
        } else {
            if (!emailValidator(email)) {
                setError('Invalid email');
                return;
            }
            if (!passwordValidator(password)) {
                setError('Invalid password');
                return;
            }
            if (!nameValidator(name)) {
                setError('Invalid name');
                return;
            }
            try {
                const response = await axios.post('http://localhost:5000/api/auth/register', {
                    name_surname: name,
                    email: email,
                    password: password
                });
                console.log(response);
                if (response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                const resData = await response.data;
                console.log(resData);
                //Success message with link to login page
                setError('Registration successful. Please login.');

            } catch (err) {
                console.log(err);
                setError(err.response.data.message);
            }
        }
    };

    return (
        <React.Fragment>
          <div className="auth-body">
            <div className="auth-img-container">
              <img src={white_logo_only} className="white_logo_only" alt="White version of groupomania logo." />
            </div>
            <div className="auth-form-container">
                    <div className="auth-card-header">
                        <img src={logo} alt="logo" className="auth-logo" />
                        <h1 className="auth-title">Un espace de communication pour vous et votre équipe.</h1>
                        <h2 className="auth-subtitle">Discutez, partagez, et échangez dès maintenant.</h2>
                    </div>
                    <div className="auth-card">
                        <form onSubmit={submitHandler}>
                            {!isLogin && (
                                <div className="auth-form-control">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={event => {
                                            setName(event.target.value);
                                        }}
                                    />
                                </div>
                            )}
                            <div className="auth-form-control">
                                <label htmlFor="email">E-Mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={event => {
                                        setEmail(event.target.value);
                                    }
                                    }
                                />
                            </div>
                            <div className="auth-form-control">
                                <label htmlFor="password">Password</label>
                                <input

                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={event => {
                                        setPassword(event.target.value);
                                    }
                                    }
                                />
                            </div>
                            <div className="auth-form-actions">
                                <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
                                <button type="button" onClick={switchModeHandler}>
                                    Switch to {isLogin ? 'Signup' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            {error && <p className="error">{error}</p>}
          </div>
        </React.Fragment>
    );
};

export default AuthPage;
