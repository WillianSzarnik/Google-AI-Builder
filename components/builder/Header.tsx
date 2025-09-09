import React, { useState } from 'react';
import Button from '../ui/Button';
import SettingsIcon from '../icons/SettingsIcon';
import { useAppContext } from '../../context/AppContext';
import { API_CONFIG } from '../../constants';

interface HeaderProps {
    onBackToHome: () => void;
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBackToHome, onOpenSettings }) => {
  const { apiKeys } = useAppContext();
  const [isStatusHovered, setIsStatusHovered] = useState(false);
  
  const primaryKeyConfigured = !!apiKeys.gemini;

  return (
    <header className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center">
        <Button onClick={onBackToHome} variant="ghost" className="mr-2">
            &larr; Home
        </Button>
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          AI Builder UI
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div 
            className="relative hidden sm:block"
            onMouseEnter={() => setIsStatusHovered(true)}
            onMouseLeave={() => setIsStatusHovered(false)}
        >
            <div className="flex items-center space-x-2 cursor-default">
                <span className={`h-2 w-2 rounded-full ${primaryKeyConfigured ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                <span className="text-xs text-gray-300">API Status</span>
            </div>
            {isStatusHovered && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg p-3 z-20">
                    <ul className="space-y-2">
                        {API_CONFIG.map(({ key, label }) => {
                            const isConfigured = !!apiKeys[key];
                            return (
                                <li key={key} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-300">{label.replace(' API Key', '')}</span>
                                    <span className={isConfigured ? 'text-green-400' : 'text-yellow-400'}>
                                        {isConfigured ? 'Configured' : 'Not Set'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
         <Button variant="secondary" className="text-xs">Export Code</Button>
         <Button onClick={onOpenSettings} variant="ghost" className="p-2 rounded-full" aria-label="Open Settings">
            <SettingsIcon className="w-5 h-5 text-gray-300" />
         </Button>
      </div>
    </header>
  );
};

export default Header;
