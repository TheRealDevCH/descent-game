import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import multiplayerService from '../utils/multiplayerService';
import audioSystem from '../utils/audioSystem';
import './UsernameInput.css';

function UsernameInput({ onComplete }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (username.length > 50) {
      setError('Username must be less than 50 characters');
      setIsLoading(false);
      return;
    }

    try {
      audioSystem.playSound('click');
      await multiplayerService.createPlayer(username);
      onComplete();
    } catch (err) {
      setError(err.message);
      audioSystem.playSound('collision');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="username-input-container fade-in">
      <div className="username-input-content">
        <h1 className="username-title">DESCENT</h1>
        <p className="username-subtitle">Create Your Profile</p>

        <form onSubmit={handleSubmit} className="username-form">
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength="50"
              disabled={isLoading}
              className="username-input"
              autoFocus
            />
            <div className="input-counter">
              {username.length}/50
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || username.length < 3}
            className="button button-play"
          >
            {isLoading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>

        <p className="username-info">
          Choose a unique username to start playing!
        </p>
      </div>
    </div>
  );
}

export default UsernameInput;

