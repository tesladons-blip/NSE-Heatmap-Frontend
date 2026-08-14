import React, { useState, useEffect } from 'react';
import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
  Rectangle
} from 'recharts';

// Custom Treemap Node to show data
const CustomNode = (props) => {
  const {
    x, y, width, height, index, payload, colors, rank
  } = props;
App.js
  // Calculate text position
  const textSize = Math.min(width, height) > 100 ? 14 : 10;
  const hasRoom = width > 80 && height > 60;

  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: payload.color,
          stroke: '#fff',
          strokeWidth: 2,
          opacity: 0.9,
          cursor: 'pointer',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.9'}
      />
      {hasRoom && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 15}
            textAnchor="middle"
            fill="#fff"
            fontSize={textSize}
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {payload.name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={textSize - 2}
            style={{ pointerEvents: 'none' }}
          >
            {payload.value > 0 ? '+' : ''}{payload.value}%
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 25}
            textAnchor="middle"
            fill="#e5e7eb"
            fontSize={textSize - 3}
            style={{ pointerEvents: 'none' }}
          >
            {payload.stocks} stocks
          </text>
        </>
      )}
    </g>
  );
};

// Custom Tooltip
const CustomTooltip = (props) => {
  if (!props.payload || props.payload.length === 0) {
    return null;
  }

  const data = props.payload[0].payload;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded p-3 shadow-lg">
      <p className="text-white font-bold">{data.name}</p>
      <p className={data.value > 0 ? 'text-green-400' : 'text-red-400'}>
        Change: {data.value > 0 ? '+' : ''}{data.value}%
      </p>
      <p className="text-gray-300 text-sm">Stocks: {data.stocks}</p>
      <p className="text-gray-400 text-xs">Volume: {(data.volume / 1000000).toFixed(1)}M</p>
    </div>
  );
};

export default function HeatmapDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // API endpoint - change this to your deployed backend URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/heatmap`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
      setLastUpdated(result.timestamp);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      // Retry after 5 seconds
      setTimeout(fetchData, 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Loading...';
    try {
      return new Date(ts).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return ts;
    }
  };

  // Stats
  const gainers = data.filter(d => d.value > 0).length;
  const losers = data.filter(d => d.value < 0).length;
  const avgReturn = data.length > 0 ? (data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(2) : 0;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                NSE Sector Heatmap
              </h1>
              <p className="text-gray-400 text-sm">
                Market strength by sector • Updated {formatTimestamp(lastUpdated)}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="bg-slate-800 rounded p-3 border border-slate-700">
              <p className="text-gray-400">Total Sectors</p>
              <p className="text-2xl font-bold text-white">{data.length}</p>
            </div>
            <div className="bg-slate-800 rounded p-3 border border-slate-700">
              <p className="text-gray-400">Gainers</p>
              <p className="text-2xl font-bold text-green-400">{gainers}</p>
            </div>
            <div className="bg-slate-800 rounded p-3 border border-slate-700">
              <p className="text-gray-400">Losers</p>
              <p className="text-2xl font-bold text-red-400">{losers}</p>
            </div>
            <div className="bg-slate-800 rounded p-3 border border-slate-700">
              <p className="text-gray-400">Avg Return</p>
              <p className={`text-2xl font-bold ${avgReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {avgReturn > 0 ? '+' : ''}{avgReturn}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded mb-4">
            Error: {error}
            <br/>
            <small>Make sure backend is running and API_URL is correct</small>
          </div>
        )}

        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-gray-400 mt-4">Fetching market data...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <ResponsiveContainer width="100%" height={600}>
              <Treemap
                data={data}
                dataKey="size"
                fill="#8884d8"
                content={<CustomNode />}
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              >
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No data available</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-white font-bold mb-3">Color Legend</h3>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
              <span className="text-gray-300">Strong Loss (&lt;-2%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-400 rounded"></div>
              <span className="text-gray-300">Loss (-2% to 0%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-500 rounded"></div>
              <span className="text-gray-300">Neutral (-0.5% to 0.5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-400 rounded"></div>
              <span className="text-gray-300">Gain (0.5% to 2%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
              <span className="text-gray-300">Strong Gain (&gt;2%)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-xs pb-4">
          <p>NSE Sector Heatmap • Data from yfinance • Updates every 5 minutes</p>
          <p className="mt-2">Hover over sectors for details • Click refresh for latest data</p>
        </div>
      </div>
    </div>
  );
}
