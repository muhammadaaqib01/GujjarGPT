
import React, { useState, useRef, useEffect } from 'react';
import type { Attachment } from '../types';

// Define SpeechRecognition types for window object to support different browsers
// Fix: Add necessary type definitions for the Web Speech API to resolve compilation errors.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  onstart: (this: SpeechRecognition, ev: Event) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser support for the SpeechRecognition API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechRecognitionSupported = !!SpeechRecognition;

  useEffect(() => {
    inputRef.current?.focus();
    // Cleanup function to stop speech recognition if the component unmounts
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript;
        }
        setInputText(prev => (prev.trim() ? prev.trim() + ' ' : '') + newTranscript.trim());
      };
      
      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Microphone access was denied. Please allow microphone access in your browser settings to use this feature.');
        }
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const base64String = loadEvent.target?.result as string;
            const base64Data = base64String.split(',')[1];
            setAttachments([{
                mimeType: file.type,
                data: base64Data
            }]);
        };
        reader.readAsDataURL(file);
    }
    e.target.value = ''; // Allow re-selecting the same file
  };

  const removeAttachment = () => {
    setAttachments([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
        recognitionRef.current?.stop();
    }
    if ((inputText.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(inputText, attachments);
      setInputText('');
      setAttachments([]);
    }
  };

  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 p-4 sticky bottom-0">
      <div className="max-w-3xl mx-auto">
        {attachments.length > 0 && (
            <div className="mb-3 p-2 bg-gray-800/60 rounded-lg relative w-fit animate-fade-in-slide-up">
                <img 
                    src={`data:${attachments[0].mimeType};base64,${attachments[0].data}`} 
                    alt="attachment preview"
                    className="h-16 w-16 object-cover rounded-md"
                />
                <button
                    onClick={removeAttachment}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold"
                    aria-label="Remove attachment"
                >
                    &times;
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={isLoading || attachments.length > 0}
              className="p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 text-gray-300 hover:bg-gray-600"
              aria-label="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything, or try '/imagine a cat flying...'"
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            disabled={isLoading}
          />
          {isSpeechRecognitionSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className={`p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording ? 'bg-red-500/80 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
            aria-label="Send message"
          >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            )}
          </button>
        </form>
      </div>
    </footer>
  );
};

export default ChatInput;
