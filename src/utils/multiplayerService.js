const API_URL = import.meta.env.VITE_API_URL || 'https://descent-game.vercel.app/api';

class MultiplayerService {
  constructor() {
    this.playerId = localStorage.getItem('playerId');
    this.username = localStorage.getItem('username');
    this.characterSkin = localStorage.getItem('characterSkin') || 'classic';
    this.activePlayers = [];
    this.updateInterval = null;
  }

  async createPlayer(username, characterSkin = 'classic') {
    try {
      const response = await fetch(`${API_URL}/multiplayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createPlayer',
          username,
          characterSkin
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create player');
      }

      this.playerId = data.player.id;
      this.username = username;
      this.characterSkin = characterSkin;

      localStorage.setItem('playerId', this.playerId);
      localStorage.setItem('username', this.username);
      localStorage.setItem('characterSkin', this.characterSkin);

      return data.player;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async updatePosition(positionX, positionZ, depth, speed) {
    if (!this.playerId) return;

    try {
      await fetch(`${API_URL}/multiplayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePosition',
          playerId: this.playerId,
          positionX,
          positionZ,
          depth,
          speed
        })
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  }

  async getActivePlayers() {
    try {
      const response = await fetch(`${API_URL}/multiplayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getActivePlayers' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get active players');
      }

      this.activePlayers = data.players || [];
      return this.activePlayers;
    } catch (error) {
      console.error('Error getting active players:', error);
      return [];
    }
  }

  async updateHighscore(depth) {
    if (!this.playerId) return;

    try {
      await fetch(`${API_URL}/multiplayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateHighscore',
          playerId: this.playerId,
          depth
        })
      });
    } catch (error) {
      console.error('Error updating highscore:', error);
    }
  }

  async getLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/multiplayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getLeaderboard' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get leaderboard');
      }

      return data.leaderboard || [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async removePlayer() {
    if (!this.playerId) return;

    try {
      await fetch(`${API_URL}/multiplayer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removePlayer',
          playerId: this.playerId
        })
      });
    } catch (error) {
      console.error('Error removing player:', error);
    }
  }

  startPositionUpdates(callback) {
    this.updateInterval = setInterval(async () => {
      const players = await this.getActivePlayers();
      if (callback) callback(players);
    }, 1000);
  }

  stopPositionUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  isLoggedIn() {
    return !!this.playerId && !!this.username;
  }

  logout() {
    this.playerId = null;
    this.username = null;
    this.characterSkin = 'classic';
    localStorage.removeItem('playerId');
    localStorage.removeItem('username');
    localStorage.removeItem('characterSkin');
    this.stopPositionUpdates();
  }
}

export default new MultiplayerService();

