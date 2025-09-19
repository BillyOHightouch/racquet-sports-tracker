import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
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
            pickleball_wins: playerData.pickleball?.wins || playerData.pickleball_wins || 0
          })
        });
      } else {
        response = await fetch(`${supabaseUrl}/rest/v1/players`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: playerData.name,
            table_tennis_wins: playerData.tableTennis?.wins || 0,
            pickleball_wins: playerData.pickleball?.wins || 0
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      await loadFromSupabase();
      setError('');
    } catch (err) {
      setError(`Error saving: ${err.message}`);
    }
  };

  const deleteFromSupabase = async (playerId) => {
    if (!supabaseUrl || !supabaseKey) {
      const updatedPlayers = players.filter(p => p.id !== playerId);
      setPlayers(updatedPlayers);
      if (typeof window !== 'undefined') {
        localStorage.setItem('racquetSportsPlayers', JSON.stringify(updatedPlayers));
      }
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/players?id=eq.${playerId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      await loadFromSupabase();
      setError('');
    } catch (err) {
      setError(`Error deleting: ${err.message}`);
    }
  };

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseKey', supabaseKey);
    }
    setShowSettings(false);
    if (supabaseUrl && supabaseKey) {
      loadFromSupabase();
    }
  };

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const addPlayer = async () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now(),
        name: newPlayerName.trim(),
        tableTennis: { wins: 0 },
        pickleball: { wins: 0 }
      };
      
      await saveToSupabase(newPlayer, false);
      setNewPlayerName('');
    }
  };

  const removePlayer = async (playerId) => {
    if (confirm('Are you sure you want to remove this player?')) {
      await deleteFromSupabase(playerId);
    }
  };

  const updatePlayerStats = async (playerId, sport, value) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const updatedPlayer = {
      ...player,
      [sport]: { wins: Math.max(0, parseInt(value) || 0) }
    };

    await saveToSupabase(updatedPlayer, true);
  };

  const startEditing = (playerId) => {
    setEditingPlayer(playerId);
  };

  const savePlayerEdit = async (playerId, newName) => {
    const player = players.find(p => p.id === playerId);
    if (!player || !newName.trim()) return;

    const updatedPlayer = {
      ...player,
      name: newName.trim()
    };

    await saveToSupabase(updatedPlayer, true);
    setEditingPlayer(null);
  };

  const getTotalStats = () => {
    return players.reduce((acc, player) => ({
      tableTennis: acc.tableTennis + (player.tableTennis?.wins || player.table_tennis_wins || 0),
      pickleball: acc.pickleball + (player.pickleball?.wins || player.pickleball_wins || 0),
      total: acc.total + (player.tableTennis?.wins || player.table_tennis_wins || 0) + (player.pickleball?.wins || player.pickleball_wins || 0)
    }), { tableTennis: 0, pickleball: 0, total: 0 });
  };

  const getChartData = () => {
    return players.map(player => ({
      name: player.name.length > 10 ? player.name.substring(0, 10) + '...' : player.name,
      'Table Tennis': player.tableTennis?.wins || player.table_tennis_wins || 0,
      'Pickleball': player.pickleball?.wins || player.pickleball_wins || 0,
    }));
  };

  const getSportPieData = (sport) => {
    const dbKey = sport === 'Table Tennis' ? 'table_tennis_wins' : 'pickleball_wins';
    const sportKey = sport === 'Table Tennis' ? 'tableTennis' : 'pickleball';
    
    return players.map((player, index) => ({
      name: player.name,
      value: player[sportKey]?.wins || player[dbKey] || 0,
      color: sport === 'Table Tennis' ? 
        ['#6366F1', '#8B5CF6', '#3B82F6', '#1D4ED8'][index % 4] :
        ['#10B981', '#059669', '#F59E0B', '#D97706'][index % 4]
    })).filter(item => item.value > 0);
  };

  const getLeaderboard = () => {
    return players
      .map(player => ({
        ...player,
        totalWins: (player.tableTennis?.wins || player.table_tennis_wins || 0) + 
                   (player.pickleball?.wins || player.pickleball_wins || 0)
      }))
      .sort((a, b) => b.totalWins - a.totalWins)
      .slice(0, 5);
  };

  const stats = getTotalStats();
  const leaderboard = getLeaderboard();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg border shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value} wins
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="animate-slide-up">
              <div className="flex items-center space-x-4 mb-2">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center animate-float">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Sports Leaderboard</h1>
                  <p className="text-xl text-indigo-100 font-medium">Powered by Hightouch CDP</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="glass-effect text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 group"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Settings</span>
              </button>
              
              <button
                onClick={loadFromSupabase}
                disabled={isLoading}
                className="glass-effect text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 group"
              >
                <RefreshCw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-300 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Sync</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white">{players.length}</div>
              <div className="text-indigo-200 font-medium">Players</div>
              <Users className="w-6 h-6 text-indigo-200 mx-auto mt-2" />
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white">{stats.tableTennis}</div>
              <div className="text-indigo-200 font-medium">Table Tennis</div>
              <div className="text-2xl mt-2">🏓</div>
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white">{stats.pickleball}</div>
              <div className="text-indigo-200 font-medium">Pickleball</div>
              <div className="text-2xl mt-2">🏸</div>
            </div>
            <div className="glass-effect rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-indigo-200 font-medium">Total Wins</div>
              <Award className="w-6 h-6 text-indigo-200 mx-auto mt-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 bg-white rounded-3xl shadow-xl border p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Database Integration</h2>
                <p className="text-gray-600 mt-1">Connect to Supabase for real-time shared data</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Supabase Anon Key
                </label>
                <div className="relative">
                  <input
                    type={showCredentials ? "text" : "password"}
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="Enter your Supabase anon key"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCredentials ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-8">
              <div className="flex space-x-3">
                <button
                  onClick={saveSettings}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {lastSync && (
                  <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-xl p-6 animate-slide-up">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Connection Issue</h3>
                <p className="text-red-700 mt-1">{error}</p>
                {error.includes('Error') && (
                  <p className="text-red-600 text-sm mt-2">Using local storage as fallback</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border">
            <div className="flex space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                { id: 'players', label: 'Players', icon: Users },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                { id: 'analytics', label: 'Analytics', icon: Target }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedView(id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedView === id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Dashboard View */}
        {selectedView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Add Player Section */}
            <div className="bg-white rounded-3xl shadow-xl border p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Champion</h2>
                  <p className="text-gray-600 mt-1">Join the competition and track your victories</p>
                </div>
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  />
                </div>
                <button
                  onClick={addPlayer}
                  disabled={isLoading || !newPlayerName.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center space-x-3"
                >
                  <Plus className="w-6 h-6" />
                  <span>Join Game</span>
                </button>
              </div>
            </div>

            {/* Top Performers */}
            {leaderboard.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Performers</h2>
                <div className="grid gap-4">
                  {leaderboard.map((player, index) => (
                    <div key={player.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 glow-effect' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-slate-400 text-white' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{player.name}</h3>
                          <p className="text-gray-600">
                            🏓 {player.tableTennis?.wins || player.table_tennis_wins || 0} • 
                            🏸 {player.pickleball?.wins || player.pickleball_wins || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{player.totalWins}</div>
                        <div className="text-gray-500 text-sm">total wins</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Players View */}
        {selectedView === 'players' && (
          <div className="animate-fade-in">
            {players.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl border p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
                  <Trophy className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Players Yet</h3>
                <p className="text-gray-600 text-lg mb-8">Be the first to join and start tracking your wins!</p>
                <button
                  onClick={() => setSelectedView('dashboard')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Add First Player
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {players.map((player) => (
                  <div key={player.id} className="bg-white rounded-3xl shadow-xl border p-8 card-hover">
                    <div className="flex justify-between items-start mb-6">
                      {editingPlayer === player.id ? (
                        <div className="flex items-center space-x-4 flex-1">
                          <input
                            type="text"
                            defaultValue={player.name}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                savePlayerEdit(player.id, e.target.value);
                              }
                            }}
                            className="text-2xl font-bold bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input');
                              savePlayerEdit(player.id, input.value);
                            }}
                            className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all duration-300"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center space-x-4 cursor-pointer group flex-1"
                          onClick={() => startEditing(player.id)}
                        >
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 flex items-center space-x-2">
                              <span>{player.name}</span>
                              <Edit3 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </h3>
                            <p className="text-gray-600">
                              Total: {(player.tableTennis?.wins || player.table_tennis_wins || 0) + 
                                     (player.pickleball?.wins || player.pickleball_wins || 0)} wins
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-600 p-3 rounded-xl hover:bg-red-50 transition-all duration-300 group"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Table Tennis */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🏓</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900">Table Tennis</h4>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Wins</label>
                          <input
                            type="number"
                            min="0"
                            value={player.tableTennis?.wins || player.table_tennis_wins || 0}
                            onChange={(e) => updatePlayerStats(player.id, 'tableTennis', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-lg font-semibold"
                          />
                        </div>
                      </div>

                      {/* Pickleball */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🏸</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900">Pickleball</h4>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Wins</label>
                          <input
                            type="number"
                            min="0"
                            value={player.pickleball?.wins || player.pickleball_wins || 0}
                            onChange={(e) => updatePlayerStats(player.id, 'pickleball', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-lg font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard View */}
        {selectedView === 'leaderboard' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl border p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Hall of Fame</h2>
                  <p className="text-gray-600 mt-2">Champions ranked by total victories</p>
                </div>
                <Trophy className="w-12 h-12 text-yellow-500 animate-float" />
              </div>
              
              {players.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Award className="w-12 h-12 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">No Champions Yet</h3>
                  <p className="text-gray-600">Start playing to see who makes it to the top!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {players
                    .map(player => ({
                      ...player,
                      totalWins: (player.tableTennis?.wins || player.table_tennis_wins || 0) + 
                                 (player.pickleball?.wins || player.pickleball_wins || 0)
                    }))
                    .sort((a, b) => b.totalWins - a.totalWins)
                    .map((player, index) => (
                      <div key={player.id} className={`relative overflow-hidden rounded-2xl p-6 border-2 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-yellow-300 glow-effect' :
                        index === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-300' :
                        index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        {index < 3 && (
                          <div className="absolute top-4 right-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-slate-400' :
                              'bg-gradient-to-r from-orange-400 to-red-400'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-slate-500 to-gray-500' :
                              index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                              'bg-gradient-to-r from-purple-500 to-indigo-500'
                            }`}>
                              {index < 3 ? ['👑', '🥈', '🥉'][index] : player.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div>
                              <h3 className={`text-2xl font-bold ${
                                index === 0 ? 'text-orange-900' : 'text-gray-900'
                              }`}>
                                {player.name}
                                {index === 0 && <span className="ml-2 text-yellow-500">👑</span>}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-gray-600">
                                  🏓 {player.tableTennis?.wins || player.table_tennis_wins || 0}
                                </span>
                                <span className="text-gray-600">
                                  🏸 {player.pickleball?.wins || player.pickleball_wins || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-4xl font-bold ${
                              index === 0 ? 'text-orange-600' : 'text-purple-600'
                            }`}>
                              {player.totalWins}
                            </div>
                            <div className="text-gray-500 font-medium">total wins</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {selectedView === 'analytics' && (
          <div className="animate-fade-in space-y-8">
            {players.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl border p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Data to Analyze</h3>
                <p className="text-gray-600 text-lg">Add players and record games to see analytics!</p>
              </div>
            ) : (
              <>
                {/* Performance Chart */}
                <div className="bg-white rounded-3xl shadow-xl border p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="Table Tennis" 
                          fill="url(#tableGradient)" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="Pickleball" 
                          fill="url(#pickleGradient)" 
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="tableGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                          <linearGradient id="pickleGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sport Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl shadow-xl border p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Table Tennis Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getSportPieData('Table Tennis')}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                          >
                            {getSportPieData('Table Tennis').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-xl border p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Pickleball Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getSportPieData('Pickleball')}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                          >
                            {getSportPieData('Pickleball').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg font-medium">
              Built with ❤️ using{' '}
              <span className="gradient-text font-bold">Hightouch CDP</span>
            </p>
            <p className="text-gray-400 mt-2">
              Empowering teams with data-driven insights
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
