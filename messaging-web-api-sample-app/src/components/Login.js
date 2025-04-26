import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((username === 'Momo' || username === 'JamieLee' || username === 'Raish') && password === 'Agentforce') {
            onLogin(username);
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="loginContainer">
            <div className="loginCard">
                <h1 className="loginTitle">Welcome to KatMandoo Eco</h1>
                <p className="loginSubtitle">Your Agentforce-powered plant care assistant</p>
                
                <form onSubmit={handleSubmit} className="loginForm">
                    <div className="formGroup">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    
                    <div className="formGroup">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <div className="errorMessage">{error}</div>}

                    <button type="submit" className="loginButton">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login; 