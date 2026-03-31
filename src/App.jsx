import { useState } from 'react';
import { getApiKey } from './lib/tmdb';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import Search from './components/Search';
import Recommendations from './components/Recommendations';

const TABS = [
  { id: 'recs', label: 'For You', icon: '✨' },
  { id: 'search', label: 'Search', icon: '🔍' },
];

export default function App() {
  const [apiKey, setApiKey] = useState(getApiKey());
  const [activeTab, setActiveTab] = useState('recs');
  const [country, setCountry] = useState('US');

  if (!apiKey) {
    return <ApiKeyPrompt onKeySet={setApiKey} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-purple-400">Stream</span>Finder
          </h1>
          <div className="flex items-center gap-3">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="US">US</option>
              <option value="GB">UK</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
              <option value="BR">Brazil</option>
              <option value="JP">Japan</option>
              <option value="MX">Mexico</option>
            </select>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'search' && <Search country={country} />}
        {activeTab === 'recs' && <Recommendations country={country} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-gray-600">
          Powered by TMDB. Only shows legal, free streaming options.
        </div>
      </footer>
    </div>
  );
}
