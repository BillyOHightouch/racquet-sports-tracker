{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React, \{ useState, useEffect \} from 'react';\
import \{ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell \} from 'recharts';\
import \{ Plus, Trash2, Trophy, Target, Settings, RefreshCw, AlertCircle, Save \} from 'lucide-react';\
\
export default function RacquetSportsTracker() \{\
  const [players, setPlayers] = useState([]);\
  const [newPlayerName, setNewPlayerName] = useState('');\
  const [selectedView, setSelectedView] = useState('overview');\
  const [showSettings, setShowSettings] = useState(false);\
  const [supabaseUrl, setSupabaseUrl] = useState('');\
  const [supabaseKey, setSupabaseKey] = useState('');\
  const [isLoading, setIsLoading] = useState(false);\
  const [error, setError] = useState('');\
  const [lastSync, setLastSync] = useState(null);\
  const [editingPlayer, setEditingPlayer] = useState(null);\
\
  // Hightouch brand colors\
  const colors = \{\
    primary: '#6366F1',\
    secondary: '#8B5CF6',\
    accent: '#EC4899',\
    success: '#10B981',\
    warning: '#F59E0B',\
    background: '#F8FAFC',\
    surface: '#FFFFFF',\
    text: '#1E293B'\
  \};\
\
  const pieColors = [colors.primary, colors.secondary, colors.accent, colors.success];\
\
  // Load settings from localStorage\
  useEffect(() => \{\
    if (typeof window !== 'undefined') \{\
      setSupabaseUrl(localStorage.getItem('supabaseUrl') || '');\
      setSupabaseKey(localStorage.getItem('supabaseKey') || '');\
    \}\
  \}, []);\
\
  // Supabase API functions\
  const loadFromSupabase = async () => \{\
    if (!supabaseUrl || !supabaseKey) \{\
      if (typeof window !== 'undefined') \{\
        const savedPlayers = localStorage.getItem('racquetSportsPlayers');\
        if (savedPlayers) \{\
          setPlayers(JSON.parse(savedPlayers));\
        \}\
      \}\
      return;\
    \}\
\
    setIsLoading(true);\
    setError('');\
    \
    try \{\
      const response = await fetch(`$\{supabaseUrl\}/rest/v1/players?select=*`, \{\
        headers: \{\
          'apikey': supabaseKey,\
          'Authorization': `Bearer $\{supabaseKey\}`,\
          'Content-Type': 'application/json'\
        \}\
      \});\
\
      if (!response.ok) \{\
        throw new Error(`HTTP $\{response.status\}: Make sure your Supabase URL and key are correct`);\
      \}\
\
      const data = await response.json();\
      setPlayers(data);\
      setLastSync(new Date());\
      setError('');\
    \} catch (err) \{\
      setError(`Error loading data: $\{err.message\}`);\
      console.error('Supabase load error:', err);\
      \
      if (typeof window !== 'undefined') \{\
        const savedPlayers = localStorage.getItem('racquetSportsPlayers');\
        if (savedPlayers) \{\
          setPlayers(JSON.parse(savedPlayers));\
          setError(prev => prev + ' Using local data instead.');\
        \}\
      \}\
    \} finally \{\
      setIsLoading(false);\
    \}\
  \};\
\
  const saveToSupabase = async (playerData, isUpdate = false) => \{\
    if (!supabaseUrl || !supabaseKey) \{\
      if (typeof window !== 'undefined') \{\
        if (isUpdate) \{\
          const updatedPlayers = players.map(p => p.id === playerData.id ? playerData : p);\
          setPlayers(updatedPlayers);\
          localStorage.setItem('racquetSportsPlayers', JSON.stringify(updatedPlayers));\
        \} else \{\
          const newPlayers = [...players, playerData];\
          setPlayers(newPlayers);\
          localStorage.setItem('racquetSportsPlayers', JSON.stringify(newPlayers));\
        \}\
      \}\
      return;\
    \}\
\
    try \{\
      let response;\
      \
      if (isUpdate) \{\
        response = await fetch(`$\{supabaseUrl\}/rest/v1/players?id=eq.$\{playerData.id\}`, \{\
          method: 'PATCH',\
          headers: \{\
            'apikey': supabaseKey,\
            'Authorization': `Bearer $\{supabaseKey\}`,\
            'Content-Type': 'application/json'\
          \},\
          body: JSON.stringify(\{\
            name: playerData.name,\
            table_tennis_wins: playerData.tableTennis?.wins || playerData.table_tennis_wins || 0,\
            pickleball_wins: playerData.pickleball?.wins || playerData.pickleball_wins || 0\
          \})\
        \});\
      \} else \{\
        response = await fetch(`$\{supabaseUrl\}/rest/v1/players`, \{\
          method: 'POST',\
          headers: \{\
            'apikey': supabaseKey,\
            'Authorization': `Bearer $\{supabaseKey\}`,\
            'Content-Type': 'application/json'\
          \},\
          body: JSON.stringify(\{\
            name: playerData.name,\
            table_tennis_wins: playerData.tableTennis?.wins || 0,\
            pickleball_wins: playerData.pickleball?.wins || 0\
          \})\
        \});\
      \}\
\
      if (!response.ok) \{\
        throw new Error(`Failed to save to Supabase: $\{response.status\}`);\
      \}\
\
      await loadFromSupabase();\
      setError('');\
    \} catch (err) \{\
      setError(`Error saving data: $\{err.message\}`);\
      console.error('Supabase save error:', err);\
    \}\
  \};\
\
  const deleteFromSupabase = async (playerId) => \{\
    if (!supabaseUrl || !supabaseKey) \{\
      const updatedPlayers = players.filter(p => p.id !== playerId);\
      setPlayers(updatedPlayers);\
      if (typeof window !== 'undefined') \{\
        localStorage.setItem('racquetSportsPlayers', JSON.stringify(updatedPlayers));\
      \}\
      return;\
    \}\
\
    try \{\
      const response = await fetch(`$\{supabaseUrl\}/rest/v1/players?id=eq.$\{playerId\}`, \{\
        method: 'DELETE',\
        headers: \{\
          'apikey': supabaseKey,\
          'Authorization': `Bearer $\{supabaseKey\}`,\
        \}\
      \});\
\
      if (!response.ok) \{\
        throw new Error(`Failed to delete from Supabase: $\{response.status\}`);\
      \}\
\
      await loadFromSupabase();\
      setError('');\
    \} catch (err) \{\
      setError(`Error deleting data: $\{err.message\}`);\
      console.error('Supabase delete error:', err);\
    \}\
  \};\
\
  const saveSettings = () => \{\
    if (typeof window !== 'undefined') \{\
      localStorage.setItem('supabaseUrl', supabaseUrl);\
      localStorage.setItem('supabaseKey', supabaseKey);\
    \}\
    setShowSettings(false);\
    if (supabaseUrl && supabaseKey) \{\
      loadFromSupabase();\
    \}\
  \};\
\
  useEffect(() => \{\
    loadFromSupabase();\
  \}, []);\
\
  const addPlayer = async () => \{\
    if (newPlayerName.trim()) \{\
      const newPlayer = \{\
        id: Date.now(),\
        name: newPlayerName.trim(),\
        tableTennis: \{ wins: 0 \},\
        pickleball: \{ wins: 0 \}\
      \};\
      \
      await saveToSupabase(newPlayer, false);\
      setNewPlayerName('');\
    \}\
  \};\
\
  const removePlayer = async (playerId) => \{\
    await deleteFromSupabase(playerId);\
  \};\
\
  const updatePlayerStats = async (playerId, sport, value) => \{\
    const player = players.find(p => p.id === playerId);\
    if (!player) return;\
\
    const updatedPlayer = \{\
      ...player,\
      [sport]: \{ wins: Math.max(0, parseInt(value) || 0) \}\
    \};\
\
    await saveToSupabase(updatedPlayer, true);\
  \};\
\
  const startEditing = (playerId) => \{\
    setEditingPlayer(playerId);\
  \};\
\
  const savePlayerEdit = async (playerId, newName) => \{\
    const player = players.find(p => p.id === playerId);\
    if (!player || !newName.trim()) return;\
\
    const updatedPlayer = \{\
      ...player,\
      name: newName.trim()\
    \};\
\
    await saveToSupabase(updatedPlayer, true);\
    setEditingPlayer(null);\
  \};\
\
  const getTotalStats = (sport) => \{\
    return players.reduce((acc, player) => (\{\
      wins: acc.wins + (player[sport]?.wins || player[`$\{sport\}_wins`] || 0)\
    \}), \{ wins: 0 \});\
  \};\
\
  const getChartData = () => \{\
    return players.map(player => (\{\
      name: player.name,\
      'Table Tennis Wins': player.tableTennis?.wins || player.table_tennis_wins || 0,\
      'Pickleball Wins': player.pickleball?.wins || player.pickleball_wins || 0,\
    \}));\
  \};\
\
  const getSportPieData = (sport) => \{\
    const sportKey = sport === 'Table Tennis' ? 'tableTennis' : 'pickleball';\
    const dbKey = sport === 'Table Tennis' ? 'table_tennis_wins' : 'pickleball_wins';\
    \
    return players.map((player, index) => (\{\
      name: player.name,\
      value: player[sportKey]?.wins || player[dbKey] || 0,\
      wins: player[sportKey]?.wins || player[dbKey] || 0\
    \})).filter(item => item.value > 0);\
  \};\
\
  const CustomTooltip = (\{ active, payload, label \}) => \{\
    if (active && payload && payload.length) \{\
      return (\
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">\
          <p className="font-medium text-gray-900">\{label\}</p>\
          \{payload.map((entry, index) => (\
            <p key=\{index\} style=\{\{ color: entry.color \}\}>\
              \{entry.dataKey\}: \{entry.value\}\
            </p>\
          ))\}\
        </div>\
      );\
    \}\
    return null;\
  \};\
\
  return (\
    <div className="min-h-screen" style=\{\{ backgroundColor: colors.background \}\}>\
      <style jsx global>\{`\
        * \{\
          box-sizing: border-box;\
        \}\
        body \{\
          margin: 0;\
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;\
        \}\
      `\}</style>\
\
      \{/* Header */\}\
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">\
        <div className="max-w-6xl mx-auto">\
          <div className="flex items-center justify-between">\
            <div>\
              <h1 className="text-3xl font-bold mb-2">Racquet Sports Tracker</h1>\
              <p className="text-indigo-100">Powered by Hightouch CDP</p>\
            </div>\
            <div className="flex items-center space-x-4">\
              <button\
                onClick=\{() => setShowSettings(!showSettings)\}\
                className="bg-white/20 text-white px-3 py-2 rounded-md hover:bg-white/30 transition-colors flex items-center space-x-2"\
                title="Settings"\
              >\
                <Settings className="w-5 h-5" />\
                <span className="text-sm">Settings</span>\
              </button>\
              <button\
                onClick=\{loadFromSupabase\}\
                disabled=\{isLoading\}\
                className="bg-white/20 text-white px-3 py-2 rounded-md hover:bg-white/30 transition-colors disabled:opacity-50 flex items-center space-x-2"\
                title="Refresh Data"\
              >\
                <RefreshCw className=\{`w-5 h-5 $\{isLoading ? 'animate-spin' : ''\}`\} />\
                <span className="text-sm">Sync</span>\
              </button>\
              <div className="flex items-center space-x-2">\
                <Trophy className="w-8 h-8" />\
                <Target className="w-8 h-8" />\
              </div>\
            </div>\
          </div>\
        </div>\
      </div>\
\
      <div className="max-w-6xl mx-auto p-6">\
        \{/* Settings Panel */\}\
        \{showSettings && (\
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">\
            <h2 className="text-xl font-bold text-gray-900 mb-4">Supabase Database Integration</h2>\
            <div className="space-y-4">\
              <div>\
                <label className="block text-sm font-medium text-gray-700 mb-1">\
                  Supabase Project URL\
                </label>\
                <input\
                  type="text"\
                  value=\{supabaseUrl\}\
                  onChange=\{(e) => setSupabaseUrl(e.target.value)\}\
                  placeholder="https://your-project.supabase.co"\
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\
                />\
              </div>\
              <div>\
                <label className="block text-sm font-medium text-gray-700 mb-1">\
                  Supabase Anon Key\
                </label>\
                <input\
                  type="password"\
                  value=\{supabaseKey\}\
                  onChange=\{(e) => setSupabaseKey(e.target.value)\}\
                  placeholder="Enter your Supabase anon key"\
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\
                />\
              </div>\
              <div className="flex space-x-3">\
                <button\
                  onClick=\{saveSettings\}\
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"\
                >\
                  Save Settings\
                </button>\
                <button\
                  onClick=\{() => setShowSettings(false)\}\
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"\
                >\
                  Cancel\
                </button>\
              </div>\
            </div>\
          </div>\
        )\}\
\
        \{/* Error Display */\}\
        \{error && (\
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">\
            <div className="flex items-center space-x-2 text-red-800">\
              <AlertCircle className="w-5 h-5" />\
              <span className="font-medium">Error:</span>\
            </div>\
            <p className="text-red-700 mt-1">\{error\}</p>\
          </div>\
        )\}\
\
        \{/* Sync Status */\}\
        \{lastSync && (\
          <div className="mb-6 text-sm text-gray-600 text-center">\
            Last synced: \{lastSync.toLocaleString()\}\
            \{supabaseUrl && supabaseKey ? ' (Supabase Database)' : ' (Local storage)'\}\
          </div>\
        )\}\
\
        \{/* Navigation */\}\
        <div className="mb-6">\
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">\
            \{['overview', 'players', 'analytics'].map((view) => (\
              <button\
                key=\{view\}\
                onClick=\{() => setSelectedView(view)\}\
                className=\{`px-4 py-2 rounded-md font-medium text-sm capitalize transition-all $\{\
                  selectedView === view\
                    ? 'bg-white text-indigo-600 shadow-sm'\
                    : 'text-gray-600 hover:text-gray-900'\
                \}`\}\
              >\
                \{view\}\
              </button>\
            ))\}\
          </div>\
        </div>\
\
        \{selectedView === 'overview' && (\
          <div className="space-y-6">\
            \{/* Summary Cards */\}\
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">\
              <div className="bg-white p-6 rounded-lg shadow-sm border">\
                <h3 className="text-sm font-medium text-gray-500">Total Players</h3>\
                <p className="text-2xl font-bold text-gray-900 mt-1">\{players.length\}</p>\
              </div>\
              <div className="bg-white p-6 rounded-lg shadow-sm border">\
                <h3 className="text-sm font-medium text-gray-500">Table Tennis Wins</h3>\
                <p className="text-2xl font-bold text-indigo-600 mt-1">\
                  \{getTotalStats('tableTennis').wins + players.reduce((acc, p) => acc + (p.table_tennis_wins || 0), 0)\}\
                </p>\
              </div>\
              <div className="bg-white p-6 rounded-lg shadow-sm border">\
                <h3 className="text-sm font-medium text-gray-500">Pickleball Wins</h3>\
                <p className="text-2xl font-bold text-purple-600 mt-1">\
                  \{getTotalStats('pickleball').wins + players.reduce((acc, p) => acc + (p.pickleball_wins || 0), 0)\}\
                </p>\
              </div>\
              <div className="bg-white p-6 rounded-lg shadow-sm border">\
                <h3 className="text-sm font-medium text-gray-500">Total Wins</h3>\
                <p className="text-2xl font-bold text-pink-600 mt-1">\
                  \{getTotalStats('tableTennis').wins + getTotalStats('pickleball').wins + \
                   players.reduce((acc, p) => acc + (p.table_tennis_wins || 0) + (p.pickleball_wins || 0), 0)\}\
                </p>\
              </div>\
            </div>\
\
            \{/* Add Player Section */\}\
            <div className="bg-white p-6 rounded-lg shadow-sm border">\
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Player</h2>\
              <div className="flex space-x-3">\
                <input\
                  type="text"\
                  value=\{newPlayerName\}\
                  onChange=\{(e) => setNewPlayerName(e.target.value)\}\
                  placeholder="Enter player name"\
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\
                  onKeyPress=\{(e) => e.key === 'Enter' && addPlayer()\}\
                />\
                <button\
                  onClick=\{addPlayer\}\
                  disabled=\{isLoading\}\
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50"\
                >\
                  <Plus className="w-4 h-4" />\
                  <span>Add Player</span>\
                </button>\
              </div>\
            </div>\
          </div>\
        )\}\
\
        \{selectedView === 'players' && (\
          <div className="space-y-4">\
            \{players.length === 0 ? (\
              <div className="bg-white p-12 rounded-lg shadow-sm border text-center">\
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />\
                <h3 className="text-lg font-medium text-gray-900 mb-2">No players yet</h3>\
                <p className="text-gray-500">Add your first player to start tracking wins!</p>\
              </div>\
            ) : (\
              players.map(player => (\
                <div key=\{player.id\} className="bg-white p-6 rounded-lg shadow-sm border">\
                  <div className="flex justify-between items-start mb-4">\
                    \{editingPlayer === player.id ? (\
                      <div className="flex items-center space-x-2">\
                        <input\
                          type="text"\
                          defaultValue=\{player.name\}\
                          onKeyPress=\{(e) => \{\
                            if (e.key === 'Enter') \{\
                              savePlayerEdit(player.id, e.target.value);\
                            \}\
                          \}\}\
                          className="text-xl font-bold bg-gray-50 border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\
                          autoFocus\
                        />\
                        <button\
                          onClick=\{(e) => \{\
                            const input = e.target.parentElement.querySelector('input');\
                            savePlayerEdit(player.id, input.value);\
                          \}\}\
                          className="text-green-600 hover:text-green-800"\
                        >\
                          <Save className="w-5 h-5" />\
                        </button>\
                      </div>\
                    ) : (\
                      <h3 \
                        className="text-xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600"\
                        onClick=\{() => startEditing(player.id)\}\
                      >\
                        \{player.name\}\
                      </h3>\
                    )\}\
                    <button\
                      onClick=\{() => removePlayer(player.id)\}\
                      className="text-red-500 hover:text-red-700 transition-colors"\
                    >\
                      <Trash2 className="w-5 h-5" />\
                    </button>\
                  </div>\
\
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\
                    \{/* Table Tennis */\}\
                    <div className="space-y-3">\
                      <h4 className="font-semibold text-indigo-600 flex items-center space-x-2">\
                        <span>\uc0\u55356 \u57299 </span>\
                        <span>Table Tennis</span>\
                      </h4>\
                      <div>\
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wins</label>\
                        <input\
                          type="number"\
                          min="0"\
                          value=\{player.tableTennis?.wins || player.table_tennis_wins || 0\}\
                          onChange=\{(e) => updatePlayerStats(player.id, 'tableTennis', e.target.value)\}\
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\
                        />\
                      </div>\
                    </div>\
\
                    \{/* Pickleball */\}\
                    <div className="space-y-3">\
                      <h4 className="font-semibold text-purple-600 flex items-center space-x-2">\
                        <span>\uc0\u55356 \u57336 </span>\
                        <span>Pickleball</span>\
                      </h4>\
                      <div>\
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wins</label>\
                        <input\
                          type="number"\
                          min="0"\
                          value=\{player.pickleball?.wins || player.pickleball_wins || 0\}\
                          onChange=\{(e) => updatePlayerStats(player.id, 'pickleball', e.target.value)\}\
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"\
                        />\
                      </div>\
                    </div>\
                  </div>\
                </div>\
              ))\
            )\}\
          </div>\
        )\}\
\
        \{selectedView === 'analytics' && players.length > 0 && (\
          <div className="space-y-6">\
            \{/* Wins Bar Chart */\}\
            <div className="bg-white p-6 rounded-lg shadow-sm border">\
              <h2 className="text-xl font-bold text-gray-900 mb-4">Wins by Player</h2>\
              <ResponsiveContainer width="100%" height=\{400\}>\
                <BarChart data=\{getChartData()\}>\
                  <CartesianGrid strokeDasharray="3 3" />\
                  <XAxis dataKey="name" />\
                  <YAxis />\
                  <Tooltip content=\{<CustomTooltip />\} />\
                  <Legend />\
                  <Bar dataKey="Table Tennis Wins" fill=\{colors.primary\} />\
                  <Bar dataKey="Pickleball Wins" fill=\{colors.accent\} />\
                </BarChart>\
              </ResponsiveContainer>\
            </div>\
\
            \{/* Sport Distribution Pie Charts */\}\
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">\
              <div className="bg-white p-6 rounded-lg shadow-sm border">\
                <h3 className="text-lg font-bold text-gray-900 mb-4">Table Tennis Distribution</h3>\
                <ResponsiveContainer width="100%" height=\{300\}>\
                  <PieChart>\
                    <Pie\
                      data=\{getSportPieData('Table Tennis')\}\
                      cx="50%"\
                      cy="50%"\
                      outerRadius=\{80\}\
                      fill="#8884d8"\
                      dataKey="value"\
                      label=\{(\{ name, value \}) => `$\{name\}: $\{value\}`\}\
                    >\
                      \{getSportPieData('Table Tennis').map((entry, index) => (\
                        <Cell key=\{`cell-$\{index\}`\} fill=\{pieColors[index % pieColors.length]\} />\
                      ))\}\
                    </Pie>\
                    <Tooltip />\
                  </PieChart>\
                </ResponsiveContainer>\
              </div>\
\
              <div className="bg-white p-6 rounded-lg shadow-sm border">\
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pickleball Distribution</h3>\
                <ResponsiveContainer width="100%" height=\{300\}>\
                  <PieChart>\
                    <Pie\
                      data=\{getSportPieData('Pickleball')\}\
                      cx="50%"\
                      cy="50%"\
                      outerRadius=\{80\}\
                      fill="#8884d8"\
                      dataKey="value"\
                      label=\{(\{ name, value \}) => `$\{name\}: $\{value\}`\}\
                    >\
                      \{getSportPieData('Pickleball').map((entry, index) => (\
                        <Cell key=\{`cell-$\{index\}`\} fill=\{pieColors[index % pieColors.length]\} />\
                      ))\}\
                    </Pie>\
                    <Tooltip />\
                  </PieChart>\
                </ResponsiveContainer>\
              </div>\
            </div>\
          </div>\
        )\}\
\
        \{selectedView === 'analytics' && players.length === 0 && (\
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">\
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />\
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data to analyze</h3>\
            <p className="text-gray-500">Add players and record some games to see analytics!</p>\
          </div>\
        )\}\
      </div>\
\
      \{/* Footer */\}\
      <div className="bg-gray-50 border-t mt-12">\
        <div className="max-w-6xl mx-auto px-6 py-4">\
          <p className="text-center text-sm text-gray-600">\
            Built with \uc0\u10084 \u65039  using <span className="font-weight: 600; color: #6366F1;">Hightouch CDP</span> branding\
          </p>\
        </div>\
      </div>\
    </div>\
  );\
\}}