import React, { useState } from 'react';
import { GenerationMode } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CodeIcon from '../icons/CodeIcon';
import GlobeIcon from '../icons/GlobeIcon';
import SettingsIcon from '../icons/SettingsIcon';
import SettingsModal from '../modals/SettingsModal';
import { useAppContext } from '../../context/AppContext';

interface HomeScreenProps {
  onGenerationStart: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGenerationStart }) => {
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.Prompt);
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { startGeneration, isLoading } = useAppContext();

  const handleGenerate = async () => {
    const input = mode === GenerationMode.Prompt ? prompt : url;
    if (!input) return;

    await startGeneration(mode, input);
    onGenerationStart();
  };
  
  const isUrlValid = (input: string) => {
      try {
        new URL(input);
        return true;
      } catch (_) {
        return false;
      }
  };

  const isGenerateDisabled = isLoading || (mode === GenerationMode.Prompt && !prompt) || (mode === GenerationMode.URL && !isUrlValid(url));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 relative">
      <div className="absolute top-4 right-4">
        <Button 
            onClick={() => setIsSettingsOpen(true)} 
            variant="ghost" 
            className="p-2 rounded-full"
            aria-label="Open Settings"
        >
          <SettingsIcon className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
        </Button>
      </div>

      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-4">
          AI Builder UI
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Build React applications from a prompt or recreate any website from a URL.
        </p>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-2xl">
          <div className="flex border-b border-gray-700 mb-6">
            <TabButton
              icon={<CodeIcon className="w-5 h-5 mr-2" />}
              label="Create from Prompt"
              isActive={mode === GenerationMode.Prompt}
              onClick={() => setMode(GenerationMode.Prompt)}
            />
            <TabButton
              icon={<GlobeIcon className="w-5 h-5 mr-2" />}
              label="Recreate from URL"
              isActive={mode === GenerationMode.URL}
              onClick={() => setMode(GenerationMode.URL)}
            />
          </div>

          {mode === GenerationMode.Prompt ? (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A modern landing page for a SaaS product with a pricing table..."
              className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          ) : (
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          )}

          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={isGenerateDisabled}
            className="w-full mt-6 text-lg py-3"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-4">Powered by Gemini AI</p>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors w-1/2 ${
            isActive
            ? 'text-white border-b-2 border-indigo-500'
            : 'text-gray-400 hover:text-white'
        }`}
    >
        {icon}
        {label}
    </button>
)

export default HomeScreen;
