import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, Trophy, Target, Settings, RefreshCw, AlertCircle, Save, TrendingUp, Users, Award, Zap, Edit3, Eye, EyeOff } from 'lucide-react';

export default function RacquetSportsTracker() {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedView, setSelectedView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupabaseUrl(localStorage.getItem('supabaseUrl') || '');
      setSupabaseKey(localStorage.getItem('supabaseKey') || '');
    }
  }, []);

  const loadFromSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      if (typeof window !== 'undefined') {
        const savedPlayers = localStorage.getItem('racquetSportsPlayers');
        if (savedPlayers) {
          setPlayers(JSON.parse(savedPlayers));
        }
      }
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/players?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Check your Supabase credentials`);
      }

      const data = await response.json();
      setPlayers(data);
      setLastSync(new Date());
      setError('');
    } catch (err) {
      setError(`${err.message}`);
      
      if (typeof window !== 'undefined') {
        const savedPlayers = localStorage.getItem('racquetSportsPlayers');
        if (savedPlayers) {
          setPlayers(JSON.parse(savedPlayers));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveToSupabase = async (playerData, isUpdate = false) => {
    if (!supabaseUrl || !supabaseKey) {
      if (typeof window !== 'undefined') {
        if (isUpdate) {
          const updatedPlayers = players.map(p => p.id === playerData.id ? playerData : p);
          setPlayers(updatedPlayers);
          localStorage.setItem('racquetSportsPlayers', JSON.stringify(updatedPlayers));
        } else {
          const newPlayers = [...players, playerData];
          setPlayers(newPlayers);
          localStorage.setItem('racquetSportsPlayers', JSON.stringify(newPlayers));
        }
      }
      return;
    }

    try {
      let response;
      
      if (isUpdate) {
        response = await fetch(`${supabaseUrl}/rest/v1/players?id=eq.${playerData.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: playerData.name,
            table_tennis_wins: playerData.tableTennis?.wins || playerData.table_tennis_wins || 0,
            pickleball_wins: playerData.pickl
