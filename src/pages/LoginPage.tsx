// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SESSION_KEY,
  findStoredUser,
  registerUser,
  verifyPassword,
} from '../security/passwordAlgorithm';

type Mode = 'login' | 'register';

const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY)) {
      navigate('/');
    }
  }, [navigate]);

  const handleRegister = () => {
    setMessage(null);
    if (!username.trim() || !password) {
      setMessage({ type: 'err', text: 'Username and password are required.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'err', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: 'err', text: 'Passwords do not match.' });
      return;
    }
    if (findStoredUser(username)) {
      setMessage({ type: 'err', text: 'Username already exists. Try logging in.' });
      return;
    }
    registerUser(username, password);
    setMessage({ type: 'ok', text: 'Account created. You can now log in.' });
  };

  const handleLogin = async () => {
    setMessage(null);
    const user = findStoredUser(username);
    if (!user) {
      setMessage({ type: 'err', text: 'No account found for that username.' });
      return;
    }
    const ok = await verifyPassword(password, {
      saltHex: user.saltHex,
      rounds: user.rounds,
      hashHex: user.hashHex,
    });
    if (ok) {
      localStorage.setItem(SESSION_KEY, user.username);
      setMessage({ type: 'ok', text: `Welcome back, ${user.username}!` });
      navigate('/');
    } else {
      setMessage({ type: 'err', text: 'Incorrect password.' });
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded font-semibold ${
              mode === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded font-semibold ${
              mode === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter password"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block font-semibold mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Re-enter password"
              />
            </div>
          )}
          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          >
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 font-semibold ${
              message.type === 'ok' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
