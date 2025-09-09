import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { Sandbox } from 'e2b';
import { AppContextType, ChatMessage, GenerationMode, ApiKeys, SandboxState } from '../types';
import { generateCodeFromPrompt, generateCodeFromUrl } from '../services/geminiService';

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialApiKeys = (): ApiKeys => {
  try {
    const storedKeys = localStorage.getItem('apiKeys');
    const defaultKeys: ApiKeys = {
      gemini: '',
      openai: '',
      anthropic: '',
      groq: '',
      firecrawl: '',
      e2b: '',
    };
    return storedKeys ? { ...defaultKeys, ...JSON.parse(storedKeys) } : defaultKeys;
  } catch (error) {
    console.error('Failed to parse API keys from localStorage', error);
    return { gemini: '', openai: '', anthropic: '', groq: '', firecrawl: '', e2b: '' };
  }
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [code, setCode] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(getInitialApiKeys);

  // E2B Sandbox state
  const [sandboxState, setSandboxState] = useState<SandboxState>('idle');
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const sandboxRef = useRef<Sandbox | null>(null);
  const serverProcRef = useRef<any | null>(null);
  const isRunningSandboxRef = useRef(false);
  const sandboxRunTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);


  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const saveApiKeys = useCallback((keys: ApiKeys) => {
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    setApiKeys(keys);
    addLog("API Keys updated.");
  }, [addLog]);

  const stopSandbox = useCallback(async () => {
    if (!sandboxRef.current) return;
    addLog('Closing sandbox connection...');
    try {
      if (serverProcRef.current) {
        await serverProcRef.current.kill();
        serverProcRef.current = null;
      }
      if (sandboxRef.current) {
        await (sandboxRef.current as any).kill();
        sandboxRef.current = null;
      }
      setSandboxState('idle');
      setSandboxUrl(null);
      addLog('Sandbox connection closed.');
    } catch(e) {
        const err = e instanceof Error ? e.message : 'Unknown error';
        addLog(`Error closing sandbox: ${err}`);
        setError(`Error closing sandbox: ${err}`);
        setSandboxState('error');
    }
  }, [addLog]);

  const startSandbox = useCallback(async () => {
    const currentCode = codeRef.current;
    if (!currentCode || !apiKeys.e2b || isRunningSandboxRef.current) {
        return;
    }
    isRunningSandboxRef.current = true;
    setSandboxState('connecting');
    setError(null);
    addLog('Updating sandbox...');
    try {
        let sandbox = sandboxRef.current;
        if (!sandbox) {
            addLog('Creating new sandbox session...');
            sandbox = await Sandbox.create({ apiKey: apiKeys.e2b });
            sandboxRef.current = sandbox;
            // FIX: Replaced incorrect 'addEventListener' with 'on' for event handling, as per E2B SDK docs.
            (sandbox as any).on('exit', () => {
                addLog('Sandbox session exited unexpectedly.');
                setError('Sandbox connection lost. It may have timed out.');
                setSandboxState('error');
                sandboxRef.current = null;
                serverProcRef.current = null;
                setSandboxUrl(null);
            });
        }

        let serverProcess = serverProcRef.current;
        if (!serverProcess) {
            addLog('Starting web server in sandbox...');
            // FIX: Cast to 'any' to access 'process' as it seems to be missing from the Sandbox type definition.
            serverProcess = await (sandbox as any).process.start({
                cmd: 'python3 -m http.server 8000',
                onStdout: (data: { line: string }) => addLog(`[Server]: ${data.line}`),
                onStderr: (data: { line: string }) => addLog(`[Server Error]: ${data.line}`),
            });
            serverProcRef.current = serverProcess;
        }

        // FIX: Cast to 'any' to access 'filesystem' as it seems to be missing from the Sandbox type definition.
        await (sandbox as any).filesystem.write('index.html', currentCode);

        if (sandbox) {
            // FIX: Cast to 'any' to access 'getHostname' as it seems to be missing from the Sandbox type definition.
            const url = `https://${(sandbox as any).getHostname(8000)}?_=${Date.now()}`;
            setSandboxUrl(url);
            addLog(`Sandbox preview updated.`);
            setSandboxState('running');
        }
    } catch (e) {
        const err = e instanceof Error ? e.message : 'Unknown error';
        setError(`Sandbox error: ${err}`);
        addLog(`Sandbox error: ${err}`);
        setSandboxState('error');
        await stopSandbox();
    } finally {
        isRunningSandboxRef.current = false;
    }
  }, [apiKeys.e2b, addLog, stopSandbox]);

  useEffect(() => {
    if (sandboxRunTimeoutRef.current) {
      clearTimeout(sandboxRunTimeoutRef.current);
    }
    if (code && apiKeys.e2b) {
      sandboxRunTimeoutRef.current = setTimeout(() => {
        startSandbox();
      }, 500); // Debounce for 500ms
    }
    return () => {
      if (sandboxRunTimeoutRef.current) {
        clearTimeout(sandboxRunTimeoutRef.current);
      }
    };
  }, [code, apiKeys.e2b, startSandbox]);

  const startGeneration = useCallback(async (mode: GenerationMode, input: string) => {
    setIsLoading(true);
    setError(null);
    setLogs([]);
    setCode('');
    setChatHistory([{ role: 'system', content: 'Starting new generation...' }]);
    await stopSandbox();

    try {
        if (!apiKeys.gemini) {
            throw new Error("Gemini API Key not found. Please add it in settings.");
        }
        if (mode === GenerationMode.URL && !apiKeys.firecrawl) {
            throw new Error("Firecrawl API Key not found. Please add it for URL recreation.");
        }
        
        let fullCode = '';
        const onChunk = (chunk: string) => {
            fullCode += chunk;
            setCode(fullCode);
        };

        let userMessage = '';
        if (mode === GenerationMode.Prompt) {
            userMessage = `New prompt: "${input}"`;
            await generateCodeFromPrompt(apiKeys.gemini, input, onChunk);
        } else {
            userMessage = `Recreating from URL: "${input}"`;
            addLog("Fetching and scraping URL content... (mocked)");
            const scrapedContent = "Scraped content for " + input;
            addLog("Scraping complete. Generating code...");
            await generateCodeFromUrl(apiKeys.gemini, input, scrapedContent, onChunk);
        }
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }, { role: 'model', content: "Code generation complete." }]);
    } catch (e) {
        const err = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(err);
        addLog(`Error during generation: ${err}`);
        setChatHistory(prev => [...prev, { role: 'system', content: `Error: ${err}` }]);
    } finally {
        setIsLoading(false);
    }
  }, [apiKeys, addLog, stopSandbox]);

  const refineCode = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    
    try {
        if (!apiKeys.gemini) throw new Error("Gemini API key not configured.");
        
        // A real implementation would send the history for context
        const fullPromptForRefinement = `Refine the existing code based on this instruction: "${message}". Current code: \n\n${code}`;
        
        let fullCode = '';
        const onChunk = (chunk: string) => {
            fullCode += chunk;
            setCode(fullCode);
        };
        
        await generateCodeFromPrompt(apiKeys.gemini, fullPromptForRefinement, onChunk);
        setChatHistory(prev => [...prev, { role: 'model', content: "Refinement complete." }]);
    } catch (e) {
        const err = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(err);
        addLog(`Error during refinement: ${err}`);
        setChatHistory(prev => [...prev, { role: 'system', content: `Error: ${err}` }]);
    } finally {
        setIsLoading(false);
    }
  }, [apiKeys.gemini, addLog, code]);

  const value: AppContextType = {
    code,
    chatHistory,
    isLoading,
    error,
    logs,
    apiKeys,
    sandboxState,
    sandboxUrl,
    startGeneration,
    refineCode,
    setCode,
    saveApiKeys,
    startSandbox,
    stopSandbox,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
