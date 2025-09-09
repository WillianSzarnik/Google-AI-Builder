import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ApiKeys } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { API_CONFIG } from '../../constants';
import { validateGeminiKey, validateOpenAIKey, validateAnthropicKey, validateGroqKey, validateFirecrawlKey, validateE2BKey } from '../../services/validationService';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import XCircleIcon from '../icons/XCircleIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKeys, saveApiKeys } = useAppContext();
  const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
  const [validationStatuses, setValidationStatuses] = useState<Record<keyof ApiKeys, ValidationStatus>>(
      () => API_CONFIG.reduce((acc, { key }) => ({ ...acc, [key]: 'idle' }), {} as Record<keyof ApiKeys, ValidationStatus>)
  );

  useEffect(() => {
    // Reset local state and validation when modal opens with new context data
    if (isOpen) {
        setLocalKeys(apiKeys);
        setValidationStatuses(API_CONFIG.reduce((acc, { key }) => ({ ...acc, [key]: 'idle' }), {} as Record<keyof ApiKeys, ValidationStatus>));
    }
  }, [apiKeys, isOpen]);

  const handleSave = () => {
    saveApiKeys(localKeys);
    onClose();
  };
  
  const handleChange = (key: keyof ApiKeys, value: string) => {
      setLocalKeys(prev => ({ ...prev, [key]: value }));
      // Reset validation status for the key being changed
      setValidationStatuses(prev => ({ ...prev, [key]: 'idle' }));
  };

  const handleValidate = async (key: keyof ApiKeys) => {
    const keyValue = localKeys[key];
    if (!keyValue) return;

    setValidationStatuses(prev => ({ ...prev, [key]: 'validating' }));
    
    let isValid = false;
    try {
        switch (key) {
            case 'gemini': isValid = await validateGeminiKey(keyValue); break;
            case 'openai': isValid = await validateOpenAIKey(keyValue); break;
            case 'anthropic': isValid = await validateAnthropicKey(keyValue); break;
            case 'groq': isValid = await validateGroqKey(keyValue); break;
            case 'firecrawl': isValid = await validateFirecrawlKey(keyValue); break;
            case 'e2b': isValid = await validateE2BKey(keyValue); break;
        }
    } catch (error) {
        console.error(`Validation failed for ${key}:`, error);
        isValid = false;
    }

    setValidationStatuses(prev => ({ ...prev, [key]: isValid ? 'valid' : 'invalid' }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 id="settings-modal-title" className="text-xl font-bold">API Key Configuration</h2>
            <Button variant="ghost" onClick={onClose} className="p-1 h-auto rounded-full" aria-label="Close Settings">
                &times;
            </Button>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
            Your keys are saved securely in your browser's local storage and are never sent anywhere else.
        </p>

        <div className="space-y-6">
            {API_CONFIG.map(({ key, label, placeholder }) => (
                 <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                    <Input
                        id={key}
                        type="password"
                        placeholder={placeholder}
                        value={localKeys[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-2 h-8">
                        <Button
                            variant="secondary"
                            className="text-xs px-2 py-1"
                            onClick={() => handleValidate(key)}
                            isLoading={validationStatuses[key] === 'validating'}
                            disabled={!localKeys[key]}
                        >
                            Validate Key
                        </Button>
                        <div className="w-24 text-right">
                           {validationStatuses[key] === 'valid' && (
                                <span className="flex items-center justify-end text-green-400 text-xs font-medium">
                                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                    Valid
                                </span>
                            )}
                            {validationStatuses[key] === 'invalid' && (
                                <span className="flex items-center justify-end text-red-400 text-xs font-medium">
                                    <XCircleIcon className="w-4 h-4 mr-1.5" />
                                    Invalid
                                </span>
                            )}
                        </div>
                    </div>
                 </div>
            ))}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
