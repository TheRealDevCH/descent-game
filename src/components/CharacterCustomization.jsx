import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import audioSystem from '../utils/audioSystem';
import './CharacterCustomization.css';

function CharacterCustomization({ onComplete, username }) {
  const { t } = useTranslation();
  const [selectedSkin, setSelectedSkin] = useState('classic');
  const [selectedColor, setSelectedColor] = useState('#ff0080');

  const skins = [
    { id: 'classic', name: 'Classic', description: 'Default player' },
    { id: 'neon-warrior', name: 'Neon Warrior', description: 'Glowing warrior' },
    { id: 'cyber-ghost', name: 'Cyber Ghost', description: 'Transparent cyber' },
    { id: 'hologram', name: 'Hologram', description: 'Holographic player' },
  ];

  const colors = [
    '#ff0080',
    '#ff8c00',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#8000ff',
  ];

  const handleConfirm = () => {
    audioSystem.playSound('click');
    localStorage.setItem('characterSkin', selectedSkin);
    localStorage.setItem('characterColor', selectedColor);
    onComplete({ skin: selectedSkin, color: selectedColor });
  };

  return (
    <div className="character-customization-container fade-in">
      <div className="character-customization-content">
        <h1 className="customization-title">Customize Your Character</h1>
        <p className="customization-subtitle">Welcome, {username}!</p>

        <div className="customization-grid">
          <div className="preview-section">
            <div className="preview-box">
              <div
                className={`character-preview ${selectedSkin}`}
                style={{ borderColor: selectedColor }}
              >
                <div className="character-model" style={{ color: selectedColor }}>
                  ◆
                </div>
              </div>
            </div>
            <p className="preview-label">Your Character</p>
          </div>

          <div className="options-section">
            <div className="option-group">
              <h3 className="option-title">Select Skin</h3>
              <div className="skin-grid">
                {skins.map(skin => (
                  <button
                    key={skin.id}
                    className={`skin-option ${selectedSkin === skin.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSkin(skin.id);
                      audioSystem.playSound('click');
                    }}
                  >
                    <div className="skin-icon">{skin.name.charAt(0)}</div>
                    <div className="skin-name">{skin.name}</div>
                    <div className="skin-desc">{skin.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <h3 className="option-title">Select Color</h3>
              <div className="color-grid">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      audioSystem.playSound('click');
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button className="button button-play" onClick={handleConfirm}>
          Start Playing
        </button>
      </div>
    </div>
  );
}

export default CharacterCustomization;

