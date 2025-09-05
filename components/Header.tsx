
import React from 'react';
import type { TabDef } from '../types';
import Icon from './Icon';

interface HeaderProps {
  tabs: TabDef[];
  activeTabId: string;
  onTabSelect: (tab: TabDef) => void;
}

const Header: React.FC<HeaderProps> = ({ tabs, activeTabId, onTabSelect }) => {
  return (
    <header className="bg-gray-800/50 shadow-lg px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon name="music" className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold text-white hidden sm:block">AI Music Platform</h1>
      </div>
      <nav className="flex-1 flex justify-center items-center">
        <ul className="flex space-x-2 p-1 bg-gray-900 rounded-lg">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabSelect(tab)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTabId === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon name={tab.icon} className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="w-32"></div> {/* Spacer to balance the title */}
    </header>
  );
};

export default Header;
