
import React, { useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import HomeScreen from './components/screens/HomeScreen';
import BuilderScreen from './components/screens/BuilderScreen';
import { AppScreen } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.Home);

  const handleGenerationStart = useCallback(() => {
    setScreen(AppScreen.Builder);
  }, []);

  const handleBackToHome = useCallback(() => {
    setScreen(AppScreen.Home);
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        {screen === AppScreen.Home ? (
          <HomeScreen onGenerationStart={handleGenerationStart} />
        ) : (
          <BuilderScreen onBackToHome={handleBackToHome} />
        )}
      </div>
    </AppProvider>
  );
};

export default App;
