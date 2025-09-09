import React, { useState, useEffect } from 'react';
import ChatPanel from '../builder/ChatPanel';
import CodePanel from '../builder/CodePanel';
import PreviewPanel from '../builder/PreviewPanel';
import Header from '../builder/Header';
import SettingsModal from '../modals/SettingsModal';
import { useAppContext } from '../../context/AppContext';

interface BuilderScreenProps {
  onBackToHome: () => void;
}

const BuilderScreen: React.FC<BuilderScreenProps> = ({ onBackToHome }) => {
  const { error, isLoading, code, stopSandbox } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // This function is returned from useEffect and will be called on unmount.
    // This is crucial for cleaning up the E2B sandbox connection.
    return () => {
      stopSandbox();
    };
  }, [stopSandbox]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header onBackToHome={onBackToHome} onOpenSettings={() => setIsSettingsOpen(true)} />
      {error && (
        <div className="bg-red-500/20 text-red-300 p-4 text-center text-sm border-b border-red-500/30">
          <strong>Error:</strong> {error}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <ChatPanel />
        <div className="flex-1 border-l border-r border-gray-700">
          <CodePanel />
        </div>
        <div className="flex-1">
          <PreviewPanel />
        </div>
      </div>
      {isLoading && !code && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
           <svg className="animate-spin h-10 w-10 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-white">Generating your app...</h2>
          <p className="text-gray-400 mt-2">The AI is building your components. Please wait.</p>
        </div>
      )}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default BuilderScreen;
