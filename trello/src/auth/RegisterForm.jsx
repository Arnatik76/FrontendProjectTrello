import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, selectAuthStatus, selectAuthError } from '../store/slices/authSlice';

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Добавим поле для имени, если нужно

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) return; // Проверка на пустые поля

    try {
      // Используем .unwrap() для упрощения обработки успеха/ошибки
      await dispatch(registerUser({ name, email, password })).unwrap();
      // При успехе - переходим на страницу логина
      alert('Registration successful! Please log in.'); // Опционально: сообщение пользователю
      navigate('/login'); // <--- ИЗМЕНЕНО ЗДЕСЬ
    } catch (rejectedValueOrSerializedError) {
      // Ошибка будет поймана здесь и уже обработана в rejectWithValue
      // authError из useSelector обновится автоматически
      console.error('Registration failed:', rejectedValueOrSerializedError);
      // Можно добавить дополнительное уведомление, если нужно, но authError уже должен отображаться
    }
  };

  const isLoading = authStatus === 'loading';

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Отображаем ошибку из состояния Redux */}
        {authError && <div className="error-message">{typeof authError === 'string' ? authError : authError.message || 'Registration failed'}</div>}
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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