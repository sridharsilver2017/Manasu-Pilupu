"use client";

import { useState, useEffect, useRef } from 'react';

export default function TextToSpeech({ htmlContent, language = 'te-IN' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      // eslint-disable-next-line
      setIsSupported(false);
      return;
    }
    
    // Attempt to load voices to check support
    const voices = synth.getVoices();
    if (voices.length === 0) {
        synth.onvoiceschanged = () => {
            if (synth.getVoices().length === 0) {
                // setIsSupported(false);
            }
        };
    }
    
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const extractTextFromHtml = (html) => {
    if (typeof window === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const play = () => {
    if (!synth) return;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const textToSpeak = extractTextFromHtml(htmlContent);
    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for better comprehension

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    if (!synth) return;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const stop = () => {
    if (!synth) return;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) return null;

  return (
    <div className="text-to-speech-container" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid var(--border-color, rgba(0,0,0,0.05))'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Listen to Article</span>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
        {!isPlaying ? (
          <button 
            onClick={play}
            style={{
              background: 'var(--primary-color, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            title={isPaused ? "Resume" : "Play"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        ) : (
          <button 
            onClick={pause}
            style={{
              background: '#f59e0b', // amber
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            title="Pause"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        )}
        
        {(isPlaying || isPaused) && (
          <button 
            onClick={stop}
            style={{
              background: '#ef4444', // red
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            title="Stop"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="5" y="5" width="14" height="14"></rect>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
