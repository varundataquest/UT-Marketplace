
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Search,
  Loader2,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchByVoice } from '@/api/functions';

export default function VoiceAssistant({ onSearchResults, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Check for Web Speech API support
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (speechRecognition && speechSynthesis) {
      setIsSupported(true);
      synthRef.current = speechSynthesis;
      
      // Initialize speech recognition
      const recognition = new speechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Voice recognition started');
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        // Process final transcript
        if (finalTranscript) {
          handleVoiceQuery(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsActivated(false);
        
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
          onError?.('Microphone access denied. Please enable microphone permissions.');
        } else {
          setError('Voice recognition failed. Please try again.');
          onError?.('Voice recognition failed. Please try again.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      
      // Set up wake word detection
      setupWakeWordDetection();
    } else {
      setIsSupported(false);
      setShowFallback(true);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const setupWakeWordDetection = () => {
    // In a real implementation, you'd use a more sophisticated wake word detection
    // For demo purposes, we'll listen for "Hey Base44" or "Hey Marketplace"
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'm') { // Ctrl+M shortcut
        activateVoiceAssistant();
      }
    });
  };

  const activateVoiceAssistant = () => {
    if (!isSupported || isListening) return;
    
    setIsActivated(true);
    setTranscript('');
    setError(null);
    
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsActivated(false);
  };

  const handleVoiceQuery = async (query) => {
    setLastQuery(query);
    setIsProcessing(true);
    setError(null);
    stopListening();
    
    try {
      // Process the voice query with better error handling
      const response = await searchByVoice({ query });
      
      if (response && response.data && response.data.success) {
        onSearchResults?.(response.data.results, response.data);
      } else {
        const errorMsg = response?.data?.error || 'No results found for your search.';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (error) {
      console.error('Voice search error:', error);
      const errorMsg = 'Search failed. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
    }
    
    setIsProcessing(false);
    setIsActivated(false);
  };

  const handleTextSearch = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    
    await handleVoiceQuery(transcript);
    setTranscript('');
  };

  if (!isSupported) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 z-50 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Voice Assistant Unavailable</p>
              <p className="text-sm text-orange-700">Your browser doesn't support voice recognition.</p>
            </div>
          </div>
          <form onSubmit={handleTextSearch} className="mt-3 flex gap-2">
            <Input
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type your search instead..."
              className="flex-1"
            />
            <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Voice Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={activateVoiceAssistant}
          disabled={isListening || isProcessing}
          className={`w-16 h-16 rounded-full shadow-lg border-2 ${
            error
              ? 'bg-red-500 hover:bg-red-600 border-red-300'
              : isActivated 
              ? 'bg-orange-500 hover:bg-orange-600 border-orange-300 animate-pulse' 
              : 'bg-orange-600 hover:bg-orange-700 border-orange-300'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : error ? (
            <AlertCircle className="w-6 h-6 text-white" />
          ) : isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </motion.div>

      {/* Voice Assistant Interface */}
      <AnimatePresence>
        {isActivated && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 z-50"
          >
            <Card className="border-2 border-orange-600 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="font-semibold text-orange-900">Longhorn Voice Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopListening}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <MicOff className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-sm text-red-600 font-medium">Error:</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {isListening && !error && (
                    <div className="text-center">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center justify-center gap-2 text-orange-600"
                      >
                        <Volume2 className="w-5 h-5" />
                        <span>Listening for your request...</span>
                      </motion.div>
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-800 mb-1">📢 REQUIRED FORMAT:</p>
                        <p className="text-sm text-orange-700 font-semibold">"Find me [item name]"</p>
                      </div>
                    </div>
                  )}

                  {transcript && (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-sm text-orange-600 mb-1">You said:</p>
                      <p className="font-medium text-orange-900">{transcript}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-orange-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Searching the marketplace...</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-sm text-orange-800 space-y-2">
                      <p className="font-semibold flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        How to Use Voice Search:
                      </p>
                      <div className="space-y-1 text-orange-700">
                        <p className="font-medium">✅ Say "Find me..." followed by what you want:</p>
                        <div className="ml-4 space-y-1 text-sm">
                          <p>• "Find me a couch"</p>
                          <p>• "Find me textbooks"</p>
                          <p>• "Find me a desk lamp"</p>
                          <p>• "Find me a bike"</p>
                        </div>
                        <p className="font-medium text-red-600 mt-2">❌ Don't say:</p>
                        <div className="ml-4 space-y-1 text-sm text-red-600">
                          <p>• "Couch" (missing "Find me")</p>
                          <p>• "I want a couch" (wrong format)</p>
                          <p>• "Show me couches" (wrong format)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-orange-500">
                    <MessageCircle className="w-3 h-3" />
                    <span>Press Ctrl+M to activate anytime • Hook 'em! 🤘</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Tooltip - Updated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-24 right-20 z-40"
      >
        <Badge variant="outline" className="bg-white shadow-md border-orange-300 text-orange-700">
          Say "Find me..." or press Ctrl+M
        </Badge>
      </motion.div>
    </>
  );
}
