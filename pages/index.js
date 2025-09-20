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
    } cat
