import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';
import RefreshIcon from '../icons/RefreshIcon';

const SandboxStatusIndicator: React.FC = () => {
    const { sandboxState } = useAppContext();

    switch (sandboxState) {
        case 'connecting':
            return (
                <div className="flex items-center text-xs text-yellow-400">
                    <svg className="animate-spin h-4 w-4 mr-2 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                </div>
            );
        case 'running':
            return (
                <div className="flex items-center text-xs text-green-400">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Preview
                </div>
            );
        case 'error':
            return (
                <div className="flex items-center text-xs text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                    Error
                </div>
            );
        case 'idle':
        default:
            return (
                <div className="flex items-center text-xs text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                    Idle
                </div>
            );
    }
}

const PreviewPanel: React.FC = () => {
  const {
    code,
    apiKeys,
    sandboxState,
    sandboxUrl,
    startSandbox,
    error,
  } = useAppContext();

  const hasE2BKey = !!apiKeys.e2b;

  const handleRefresh = () => {
      if(sandboxState !== 'connecting') {
          startSandbox();
      }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-2 border-b border-gray-700 flex items-center justify-between bg-gray-800">
        <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Sandbox Preview</h2>
             <Button
                variant="ghost"
                className="p-1 h-auto"
                onClick={handleRefresh}
                disabled={sandboxState === 'connecting' || !code}
                aria-label="Refresh Sandbox Preview"
            >
                <RefreshIcon className={`w-4 h-4 text-gray-400 hover:text-white transition-colors ${sandboxState === 'connecting' ? 'animate-spin' : ''}`} />
            </Button>
        </div>
        <SandboxStatusIndicator />
      </div>
      <div className="flex-1 bg-white relative">
        {!sandboxUrl ? (
          <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center text-center p-4">
            <div className="max-w-md w-full">
                {sandboxState === 'error' ? (
                  <>
                    <h3 className="text-red-600 font-semibold mb-2">Sandbox Error</h3>
                    <p className="text-gray-600 text-sm bg-red-50 border border-red-200 rounded p-3 text-left break-words">
                      {error || 'An unexpected error occurred. Check the logs for more details.'}
                    </p>
                  </>
                ) : !hasE2BKey ? (
                <>
                    <h3 className="text-gray-700 font-semibold mb-2">E2B API Key Not Set</h3>
                    <p className="text-gray-500 text-sm">
                    Please configure your E2B API key in settings for the live preview to work.
                    </p>
                </>
                ) : !code ? (
                <p className="text-gray-500">Waiting for AI to generate code...</p>
                ) : (
                <>
                    <h3 className="text-gray-700 font-semibold mb-2">Sandbox Idle</h3>
                    <p className="text-gray-500 text-sm">
                      The sandbox is ready. The preview will automatically update when code is generated or changed.
                    </p>
                </>
                )}
            </div>
          </div>
        ) : (
          <iframe
            src={sandboxUrl}
            title="Sandbox Preview"
            className="w-full h-full border-none"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        )}
        {sandboxState === 'connecting' && sandboxUrl && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <span className="text-gray-600">Loading new preview...</span>
             </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
