'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

// You will need to replace this with your actual WordPress site URL after uploading the plugin
const WP_API_BASE_URL = 'https://dev-sridhar-silver.pantheonsite.io/wp-json/mp-maintenance/v1';

export default function AdminPage() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current status on load
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${WP_API_BASE_URL}/status`);
        if (res.ok) {
          const data = await res.json();
          setIsMaintenance(data.isMaintenance);
        }
      } catch (err) {
        console.error("Failed to fetch maintenance status", err);
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch if URL is configured
    if (WP_API_BASE_URL && WP_API_BASE_URL.includes('http')) {
      fetchStatus();
    } else {
      setIsLoading(false);
      setStatus({ type: 'warning', message: 'Please update WP_API_BASE_URL in src/app/admin/page.js' });
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!password) {
      setStatus({ type: 'error', message: 'Please enter the admin password.' });
      return;
    }

    try {
      const res = await fetch(`${WP_API_BASE_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          isMaintenance: isMaintenance
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Settings saved successfully!' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to save settings. Incorrect password?' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold">Maintenance Admin</h1>
          <p className="text-blue-100 text-sm mt-1">Manage global website status</p>
        </div>

        {/* Form Body */}
        <div className="p-8">

          {/* Status Message */}
          {status.message && (
            <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                status.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
              {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
              <span className="text-sm">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">

            {/* Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-[#222]">
              <div>
                <label className="font-semibold text-gray-900 dark:text-gray-100 block">Maintenance Mode</label>
                <span className="text-sm text-gray-500 dark:text-gray-400">Lock the site for all users</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isMaintenance}
                  onChange={(e) => setIsMaintenance(e.target.checked)}
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#222] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter password to authorize"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Loading...' : 'Save Settings'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
