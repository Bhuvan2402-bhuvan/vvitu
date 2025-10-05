import React, { useState } from 'react';
import { User, UserRole } from '../types';
import api from '../services/mockApi';

interface AuthProps {
    onLoginSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login State
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    // Signup State
    const [signupName, setSignupName] = useState('');
    const [signupRollNo, setSignupRollNo] = useState('');
    const [signupBranch, setSignupBranch] = useState('');
    const [signupYearSec, setSignupYearSec] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const user = api.login(loginIdentifier, loginPassword);
        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Invalid credentials or user not found.');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const newUser = api.signup({
            name: signupName,
            rollNo: signupRollNo,
            branch: signupBranch,
            yearSec: signupYearSec,
            phone: signupPhone,
            password: signupPassword,
        });
        if (newUser) {
            setSuccess('Registration successful! Please wait for admin approval.');
            setIsLogin(true);
        } else {
            setError('User with this name or roll number already exists.');
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-center text-gray-800">{isLogin ? 'Login' : 'Volunteer Signup'}</h2>
            
            {error && <p className="text-center text-red-700 bg-red-100 p-3 rounded-lg">{error}</p>}
            {success && <p className="text-center text-green-700 bg-green-100 p-3 rounded-lg">{success}</p>}

            {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Roll Number</label>
                        <input
                            type="text"
                            value={loginIdentifier}
                            onChange={e => setLoginIdentifier(e.target.value)}
                            required
                            className="w-full p-3 mt-1 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Roll Number (or Admin Name)"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Password</label>
                        <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full p-3 mt-1 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold transition duration-300">Login</button>
                </form>
            ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                     <input type="text" placeholder="Name" value={signupName} onChange={e => setSignupName(e.target.value)} required className="w-full p-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     <input type="text" placeholder="Roll Number" value={signupRollNo} onChange={e => setSignupRollNo(e.target.value)} required className="w-full p-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     <input type="text" placeholder="Branch" value={signupBranch} onChange={e => setSignupBranch(e.target.value)} required className="w-full p-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     <input type="text" placeholder="Year & Section" value={signupYearSec} onChange={e => setSignupYearSec(e.target.value)} required className="w-full p-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     <input type="tel" placeholder="Phone Number" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} required className="w-full p-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                     <input type="password" placeholder="Set Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="w-full p-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-md text-white font-bold transition duration-300">Sign Up</button>
                </form>
            )}

            <p className="text-center">
                <button onClick={() => {setIsLogin(!isLogin); setError(''); setSuccess('');}} className="text-blue-600 hover:underline">
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
                </button>
            </p>
        </div>
    );
};

export default Auth;