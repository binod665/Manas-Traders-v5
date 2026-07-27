import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveSupabaseConfig, clearSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../config';
import { getTranslation } from '../translations';
import { Database, Key, Check, Copy, AlertCircle, RefreshCw, X, Code, ExternalLink } from 'lucide-react';

export const SupabaseConfigModal: React.FC = () => {
  const {
    language,
    activeModal,
    setActiveModal,
    isSupabaseConnected,
    refreshProducts,
    addToast,
  } = useApp();

  const [url, setUrl] = useState(
    localStorage.getItem('manas_traders_supabase_config_url') || ''
  );
  const [anonKey, setAnonKey] = useState(
    localStorage.getItem('manas_traders_supabase_config_key') || ''
  );
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  if (activeModal !== 'supabaseConfig') return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    await refreshProducts();
    addToast('Supabase Config Saved', 'Database connection updated successfully.', 'success');
    setActiveModal(null);
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    addToast('Config Cleared', 'Reset to local demo storage mode.', 'info');
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    addToast('Copied!', getTranslation(language, 'sqlCopied'), 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 my-6"
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">{getTranslation(language, 'supabaseConfig')}</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Indicator */}
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isSupabaseConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold ${
                isSupabaseConnected ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm">
                {isSupabaseConnected
                  ? getTranslation(language, 'supabaseConnected')
                  : getTranslation(language, 'supabaseOffline')}
              </h4>
              <p className="mt-0.5 opacity-90">
                {isSupabaseConnected
                  ? 'Your app is actively syncing products and orders with your Supabase PostgreSQL instance.'
                  : 'Currently running in offline LocalStorage demo mode. Enter your Supabase credentials below to connect your free database.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Supabase Project URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full pl-3 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-3 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{getTranslation(language, 'saveConfig')}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                Reset
              </button>
            </div>
          </form>

          {/* SQL Schema Accordion */}
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowSql(!showSql)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-700" />
                <span>{getTranslation(language, 'viewSqlSchema')}</span>
              </span>
              <span className="text-emerald-700 underline text-[11px]">
                {showSql ? 'Hide' : 'Show SQL'}
              </span>
            </button>

            {showSql && (
              <div className="mt-3 relative">
                <div className="flex justify-between items-center bg-gray-800 text-gray-300 px-3 py-1.5 rounded-t-xl text-[11px] font-mono">
                  <span>Supabase PostgreSQL Migration</span>
                  <button
                    onClick={copySql}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : getTranslation(language, 'copySql')}</span>
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-emerald-300 rounded-b-xl text-[10px] font-mono max-h-48 overflow-y-auto leading-relaxed border border-gray-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
