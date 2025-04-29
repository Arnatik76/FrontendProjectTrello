import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, selectAuthStatus, selectAuthError } from '../store/slices/authSlice';
import ThemeToggle from '../components/ThemeToggle';
import styles from './Auth.module.css';

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      console.log('Login successful, navigating to /');
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const isLoading = authStatus === 'loading';

  return (
    <div className={styles.authContainer}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {authError && (
          <div className={styles.errorMessage}>
            {typeof authError === 'string' 
              ? authError 
              : authError.message || 'Login failed. Please check your credentials.'}
          </div>
        )}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginForm;