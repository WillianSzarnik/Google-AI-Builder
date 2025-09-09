import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const DEBOUNCE_DELAY = 400; // ms for a responsive "real-time" feel

const CodePanel: React.FC = () => {
  const { code, setCode, logs } = useAppContext();
  const [activeTab, setActiveTab] = React.useState<'code' | 'logs'>('code');
  
  // Local state for the textarea to enable debouncing.
  const [localCode, setLocalCode] = useState<string>(code);

  // When the global code from context changes (e.g., after AI generation),
  // update the local state to reflect it.
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  // Debounce the update to the global context. This is what triggers the 
  // preview iframe to refresh, providing a performant real-time experience.
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only update if there's a difference to avoid unnecessary re-renders.
      if (localCode !== code) {
        setCode(localCode);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup function to clear the timeout if the user types again before the delay has passed.
    return () => {
      clearTimeout(handler);
    };
  }, [localCode, code, setCode]);

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex border-b border-gray-700">
          <TabButton label="Code" isActive={activeTab === 'code'} onClick={() => setActiveTab('code')} />
          <TabButton label="Logs" isActive={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' ? (
          <textarea
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-200 resize-none outline-none"
            placeholder="AI-generated code will appear here..."
            aria-label="Code Editor"
          />
        ) : (
          <div className="w-full h-full p-4 font-mono text-xs bg-gray-900 text-gray-400 overflow-y-auto">
              {logs.map((log, index) => (
                  <p key={index} className="whitespace-pre-wrap">{log}</p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
            isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
)

export default CodePanel;
