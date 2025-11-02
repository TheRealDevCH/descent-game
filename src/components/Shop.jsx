import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import './Shop.css';

// CHF Prices (Swiss Francs)
const CURRENCY = 'CHF';
const EXCHANGE_RATE = 0.92; // USD to CHF conversion

function Shop({ onClose }) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('effects');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const products = {
    effects: [
      { id: 'neon-glow', name: 'Neon Glow', priceUSD: 0.99, description: 'Glowing aura effect' },
      { id: 'rainbow-trail', name: 'Rainbow Trail', priceUSD: 1.99, description: 'Colorful trail behind player' },
      { id: 'particle-burst', name: 'Particle Burst', priceUSD: 1.49, description: 'Burst effect on movement' },
      { id: 'cyber-pulse', name: 'Cyber Pulse', priceUSD: 2.49, description: 'Pulsing cyber effect' },
    ],
    skins: [
      { id: 'classic', name: 'Classic', priceUSD: 0, description: 'Default player skin', owned: true },
      { id: 'neon-warrior', name: 'Neon Warrior', priceUSD: 2.99, description: 'Glowing warrior skin' },
      { id: 'cyber-ghost', name: 'Cyber Ghost', priceUSD: 3.99, description: 'Transparent cyber skin' },
      { id: 'hologram', name: 'Hologram', priceUSD: 4.99, description: 'Holographic player' },
    ],
    multiplayer: [
      { id: 'friend-pass', name: 'Friend Pass', priceUSD: 0.99, description: 'Play with a friend' },
    ],
  };

  const convertPrice = (priceUSD) => {
    return (priceUSD * EXCHANGE_RATE).toFixed(2);
  };

  const handlePurchase = (product) => {
    if (product.priceUSD === 0) return;
    setSelectedProduct(product);
    audioSystem.playSound('click');
  };

  const handleStripeCheckout = async (product) => {
    setIsProcessing(true);
    try {
      const priceInCents = Math.round(convertPrice(product.priceUSD) * 100);

      // Call backend to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: priceInCents,
          currency: CURRENCY.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session');
        alert('Fehler beim Erstellen der Checkout-Session');
      }
    } catch (error) {
      console.error('Stripe error:', error);
      alert('Fehler beim Verarbeiten der Zahlung');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    audioSystem.playSound('click');
    onClose();
  };

  return (
    <div className="shop-overlay">
      <div className="shop-container">
        <div className="shop-header">
          <h1 className="shop-title">SHOP</h1>
          <button className="shop-close" onClick={handleClose}>✕</button>
        </div>

        <div className="shop-tabs">
          <button
            className={`shop-tab ${selectedTab === 'effects' ? 'active' : ''}`}
            onClick={() => setSelectedTab('effects')}
          >
            Effects
          </button>
          <button
            className={`shop-tab ${selectedTab === 'skins' ? 'active' : ''}`}
            onClick={() => setSelectedTab('skins')}
          >
            Skins
          </button>
          <button
            className={`shop-tab ${selectedTab === 'multiplayer' ? 'active' : ''}`}
            onClick={() => setSelectedTab('multiplayer')}
          >
            Multiplayer
          </button>
        </div>

        <div className="shop-products">
          {products[selectedTab].map(product => (
            <div key={product.id} className="product-card">
              <div className="product-preview">
                <div className="product-icon">
                  {selectedTab === 'effects' && '✨'}
                  {selectedTab === 'skins' && '👤'}
                  {selectedTab === 'multiplayer' && '👥'}
                </div>
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">
                  {product.priceUSD === 0 ? 'FREE' : `CHF ${convertPrice(product.priceUSD)}`}
                </span>
                <button
                  className={`product-button ${product.owned ? 'owned' : ''}`}
                  onClick={() => handlePurchase(product)}
                  disabled={product.owned}
                >
                  {product.owned ? 'OWNED' : 'BUY'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="checkout-modal">
            <div className="checkout-content">
              <h2>Purchase {selectedProduct.name}</h2>
              <p className="checkout-price">${selectedProduct.price.toFixed(2)}</p>
              <p className="checkout-description">{selectedProduct.description}</p>
              <div className="checkout-buttons">
                <button className="button button-primary" onClick={() => {
                  // Stripe integration will go here
                  console.log('Purchase:', selectedProduct);
                  setSelectedProduct(null);
                }}>
                  Pay with Stripe
                </button>
                <button className="button button-secondary" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;

