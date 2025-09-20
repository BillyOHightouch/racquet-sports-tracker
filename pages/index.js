import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    table_tennis_wins: 0,
    table_tennis_losses: 0,
    pickleball_wins: 0,
    pickleball_losses: 0
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer)
      });
      
      if (!response.ok) throw new Error('Failed to add player');
      
      await fetchPlayers();
      setNewPlayer({
        name: '',
        table_tennis_wins: 0,
        table_tennis_losses: 0,
        pickleball_wins: 0,
        pickleball_losses: 0
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePlayer = async (playerId, updatedData) => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) throw new Error('Failed to update player');
      
      await fetchPlayers();
      setEditingPlayer(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete player');
      
      await fetchPlayers();
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateWinRate = (wins, losses) => {
    const total = wins + losses;
    if (total === 0) return '0%';
    return `${((wins / total) * 100).toFixed(1)}%`;
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Racquet Sports Tracker</h1>
      
      <div className={styles.addPlayerSection}>
        <h2>Add New Player</h2>
        <form onSubmit={handleAddPlayer} className={styles.form}>
          <input
            type="text"
            placeholder="Player Name"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
            required
            className={styles.input}
          />
          <div className={styles.sportSection}>
            <h3>Table Tennis</h3>
            <input
              type="number"
              placeholder="Wins"
              value={newPlayer.table_tennis_wins}
              onChange={(e) => setNewPlayer({...newPlayer, table_tennis_wins: parseInt(e.target.value) || 0})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Losses"
              value={newPlayer.table_tennis_losses}
              onChange={(e) => setNewPlayer({...newPlayer, table_tennis_losses: parseInt(e.target.value) || 0})}
              className={styles.input}
            />
          </div>
          <div className={styles.sportSection}>
            <h3>Pickleball</h3>
            <input
              type="number"
              placeholder="Wins"
              value={newPlayer.pickleball_wins}
              onChange={(e) => setNewPlayer({...newPlayer, pickleball_wins: parseInt(e.target.value) || 0})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Losses"
              value={newPlayer.pickleball_losses}
              onChange={(e) => setNewPlayer({...newPlayer, pickleball_losses: parseInt(e.target.value) || 0})}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>Add Player</button>
        </form>
      </div>

      <div className={styles.playersSection}>
        <h2>Players</h2>
        {players.length === 0 ? (
          <p>No players yet. Add your first player above!</p>
        ) : (
          <div className={styles.playerGrid}>
            {players.map((player) => (
              <div key={player.id} className={styles.playerCard}>
                {editingPlayer === player.id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => {
                        const updated = players.map(p => 
                          p.id === player.id ? {...p, name: e.target.value} : p
                        );
                        setPlayers(updated);
                      }}
                      className={styles.input}
                    />
                    <div className={styles.statsEdit}>
                      <h4>Table Tennis</h4>
                      <label>
                        Wins:
                        <input
                          type="number"
                          value={player.table_tennis_wins}
                          onChange={(e) => {
                            const updated = players.map(p => 
                              p.id === player.id ? {...p, table_tennis_wins: parseInt(e.target.value) || 0} : p
                            );
                            setPlayers(updated);
                          }}
                          className={styles.input}
                        />
                      </label>
                      <label>
                        Losses:
                        <input
                          type="number"
                          value={player.table_tennis_losses}
                          onChange={(e) => {
                            const updated = players.map(p => 
                              p.id === player.id ? {...p, table_tennis_losses: parseInt(e.target.value) || 0} : p
                            );
                            setPlayers(updated);
                          }}
                          className={styles.input}
                        />
                      </label>
                    </div>
                    <div className={styles.statsEdit}>
                      <h4>Pickleball</h4>
                      <label>
                        Wins:
                        <input
                          type="number"
                          value={player.pickleball_wins}
                          onChange={(e) => {
                            const updated = players.map(p => 
                              p.id === player.id ? {...p, pickleball_wins: parseInt(e.target.value) || 0} : p
                            );
                            setPlayers(updated);
                          }}
                          className={styles.input}
                        />
                      </label>
                      <label>
                        Losses:
                        <input
                          type="number"
                          value={player.pickleball_losses}
                          onChange={(e) => {
                            const updated = players.map(p => 
                              p.id === player.id ? {...p, pickleball_losses: parseInt(e.target.value) || 0} : p
                            );
                            setPlayers(updated);
                          }}
                          className={styles.input}
                        />
                      </label>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button 
                        onClick={() => handleUpdatePlayer(player.id, player)}
                        className={styles.saveButton}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setEditingPlayer(null);
                          fetchPlayers();
                        }}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{player.name}</h3>
                    <div className={styles.stats}>
                      <div className={styles.sport}>
                        <h4>Table Tennis</h4>
                        <p>Wins: {player.table_tennis_wins}</p>
                        <p>Losses: {player.table_tennis_losses}</p>
                        <p>Win Rate: {calculateWinRate(player.table_tennis_wins, player.table_tennis_losses)}</p>
                      </div>
                      <div className={styles.sport}>
                        <h4>Pickleball</h4>
                        <p>Wins: {player.pickleball_wins}</p>
                        <p>Losses: {player.pickleball_losses}</p>
                        <p>Win Rate: {calculateWinRate(player.pickleball_wins, player.pickleball_losses)}</p>
                      </div>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button 
                        onClick={() => setEditingPlayer(player.id)}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePlayer(player.id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
