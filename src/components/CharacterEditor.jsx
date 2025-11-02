import { useState, useEffect } from 'react';
import audioSystem from '../utils/audioSystem';
import './CharacterEditor.css';

function CharacterEditor({ onClose }) {
  const [selectedSkin, setSelectedSkin] = useState(() => 
    localStorage.getItem('characterSkin') || 'classic'
  );
  const [selectedColor, setSelectedColor] = useState(() =>
    localStorage.getItem('characterColor') || '#ff0080'
  );

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

  const handleSave = () => {
    audioSystem.playSound('click');
    localStorage.setItem('characterSkin', selectedSkin);
    localStorage.setItem('characterColor', selectedColor);
    onClose();
  };

  const handleClose = () => {
    audioSystem.playSound('click');
    onClose();
  };

  return (
    <div className="character-editor-overlay">
      <div className="character-editor-modal fade-in">
        <button className="close-button" onClick={handleClose}>✕</button>

        <h2 className="editor-title">Character Editor</h2>

        <div className="editor-grid">
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
              <h3 className="option-title">Skin</h3>
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
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <h3 className="option-title">Color</h3>
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
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="editor-buttons">
          <button className="button button-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="button button-play" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterEditor;

