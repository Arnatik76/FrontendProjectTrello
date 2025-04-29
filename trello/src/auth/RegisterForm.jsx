import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, selectAuthStatus, selectAuthError } from '../store/slices/authSlice';
import ThemeToggle from '../components/ThemeToggle'; // Add this import
import styles from './Auth.module.css';

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    try {
      await dispatch(registerUser({ name, email, password })).unwrap();
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (rejectedValueOrSerializedError) {
      console.error('Registration failed:', rejectedValueOrSerializedError);
    }
  };

  const isLoading = authStatus === 'loading';

  return (
    <div className={styles.authContainer}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {authError && <div className={styles.errorMessage}>
          {typeof authError === 'string' ? authError : authError.message || 'Registration failed'}
        </div>}
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
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
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default RegisterForm;