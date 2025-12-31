import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, AlertCircle, Key, X, Check } from 'lucide-react';
import { testConnection, getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../services/geminiService';
import UserAvatar from './auth/UserAvatar';

const Header: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);

  // 检查是否已有存储的 Key
  useEffect(() => {
    const storedKey = getStoredApiKey();
    setHasKey(!!storedKey);
    if (storedKey) {
      setApiKeyInput(storedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      setStoredApiKey(apiKeyInput.trim());
      setHasKey(true);
      setShowKeyInput(false);
      setTestStatus('idle');
      setTestMsg('');
    }
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setApiKeyInput('');
    setHasKey(false);
    setTestStatus('idle');
    setTestMsg('');
  };

  const handleTestKey = async () => {
    if (!hasKey) {
      setShowKeyInput(true);
      return;
    }
    
    setTestStatus('loading');
    setTestMsg('正在连接 Google API...');
    try {
      await testConnection();
      setTestStatus('success');
      setTestMsg('连接成功！API Key 有效。');
      setTimeout(() => {
        setTestStatus('idle');
        setTestMsg('');
      }, 3000);
    } catch (error: any) {
      setTestStatus('error');
      setTestMsg(error.message || '连接失败，请检查 Key。');
    }
  };

  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Logo icon simulation */}
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white font-bold relative shadow-lg shadow-brand-accent/20">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-cream"></span>
            <span className="transform -rotate-12 text-xl">🔥</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">OgSprite</h1>
        </div>
        
        <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50">
          <Globe size={14} />
          <span>中文</span>
        </button>
      </div>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 mt-12 hidden md:block text-gray-400 text-sm">
        一键生成精灵图
      </div>

      <div className="flex items-center gap-3">
        {/* 用户头像 */}
        <UserAvatar />
        
        {/* API Key 输入弹窗 */}
        {showKeyInput && (
          <div className="absolute top-full right-8 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-80 z-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Key size={16} className="text-brand-accent" />
                设置 API Key
              </h3>
              <button onClick={() => setShowKeyInput(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              从 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-accent underline">Google AI Studio</a> 获取免费 Key
            </p>
            
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="粘贴你的 Gemini API Key..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="flex-1 py-2 bg-brand-accent text-white font-bold rounded-xl text-sm hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Check size={14} /> 保存
              </button>
              {hasKey && (
                <button
                  onClick={handleClearKey}
                  className="px-3 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        )}

        {/* Test API Key Button */}
        <div className="flex items-center gap-2">
           {testStatus === 'error' && <span className="text-[10px] text-red-500 max-w-[150px] truncate">{testMsg}</span>}
           {testStatus === 'success' && <span className="text-[10px] text-green-600 font-bold">连接成功</span>}
           
           {/* 设置 Key 按钮 */}
           <button 
             onClick={() => setShowKeyInput(!showKeyInput)}
             className={`
               flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
               ${hasKey 
                 ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                 : 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 animate-pulse'
               }
             `}
           >
             <Key size={14} />
             <span>{hasKey ? 'Key 已设置' : '设置 API Key'}</span>
           </button>

           {/* 测试按钮 */}
           {hasKey && (
             <button 
               onClick={handleTestKey}
               disabled={testStatus === 'loading'}
               className={`
                 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                 ${testStatus === 'error' 
                   ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                   : testStatus === 'success'
                     ? 'bg-green-50 border-green-200 text-green-600'
                     : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                 }
               `}
             >
               {testStatus === 'loading' ? (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
               ) : testStatus === 'error' ? (
                  <AlertCircle size={14} />
               ) : (
                  <ShieldCheck size={14} />
               )}
               <span>{testStatus === 'loading' ? '测试中...' : '测试连接'}</span>
             </button>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;
