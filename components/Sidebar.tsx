import React, { useState, useCallback } from 'react';
import type { TabDef, Service } from '../types';
import Icon from './Icon';
import { runGemini } from '../services/geminiService';

interface SidebarProps {
  activeTab: TabDef;
  activeService: Service | null;
  onServiceSelect: (service: Service) => void;
}

const GeminiAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');
        setResponse('');

        try {
            const result = await runGemini(prompt);
            setResponse(result);
        } catch (e) {
            setError('Failed to get response from Gemini. Please check your API key and try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                <Icon name="gemini" className="w-5 h-5 mr-2" />
                Gemini Assistant
            </h3>
            <div className="text-xs text-gray-400 mb-3">
                프로젝트 아이디어나 가이드가 필요하신가요?
            </div>
            <div className="flex flex-col space-y-3">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., '여름밤에 어울리는 힙합 가사 아이디어 줘'"
                    rows={3}
                    className="w-full bg-gray-800 text-gray-200 text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="flex justify-center items-center px-3 py-2 text-sm font-semibold rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Icon name="send" className="w-5 h-5" />
                    )}
                    <span className="ml-2">{isLoading ? '생성 중...' : '전송'}</span>
                </button>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                {response && (
                    <div className="text-sm bg-gray-800 p-3 rounded-md max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {response}
                    </div>
                )}
            </div>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ activeTab, activeService, onServiceSelect }) => {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const handleServiceClick = (service: Service) => {
    if (service.url) {
      // If the service has a URL, toggle its expanded state.
      setExpandedService(prev => (prev === service.name ? null : service.name));
    } else {
      // If it's an API-based service, select it directly and close any open toggle.
      onServiceSelect(service);
      setExpandedService(null);
    }
  };

  return (
    <aside className="h-full flex flex-col p-4 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">{activeTab.name} 서비스</h2>
        {activeTab.services.length > 0 ? (
          <ul className="space-y-1">
            {activeTab.services.map((service) => {
              const isExpanded = expandedService === service.name;
              const isActive = activeService?.name === service.name && !service.url;

              return (
                <li key={service.name} className="bg-gray-700/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleServiceClick(service)}
                    className={`w-full text-left flex items-center space-x-3 p-3 transition-colors duration-200 ${
                      isActive ? 'bg-blue-600/80 text-white' : 'hover:bg-gray-700'
                    }`}
                  >
                    <Icon name={service.icon} className="w-6 h-6 flex-shrink-0" />
                    <div className="flex-grow">
                      <p className="font-semibold text-sm">{service.name}</p>
                      <p className="text-xs text-gray-400">{service.description}</p>
                    </div>
                     {service.url && (
                      <Icon name="chevronDown" className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {isExpanded && service.url && (
                    <div className="p-3 bg-black/20">
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
                      >
                        <Icon name="externalLink" className="w-4 h-4 mr-2" />
                        {service.name}로 이동
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 px-2">이 단계에서는 선택할 서비스가 없습니다.</p>
        )}
      </div>
      <div className="flex-grow"></div>
      <GeminiAssistant />
    </aside>
  );
};

export default Sidebar;