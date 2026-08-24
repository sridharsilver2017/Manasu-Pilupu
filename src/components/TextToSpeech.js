"use client";

import { useState, useEffect, useRef } from 'react';

function chunkText(text, maxLen = 4000) {
  const chunks = [];
  let currentChunk = '';
  // Split by common Telugu and English sentence endings
  const sentences = text.split(/(?<=[.!?|])\s+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLen) {
      if (currentChunk) chunks.push(currentChunk);
      // If a single sentence is incredibly long (rare), we'd need to split it further,
      // but for standard blog posts, this is fine.
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export default function TextToSpeech({ htmlContent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [textChunks, setTextChunks] = useState([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [audioSources, setAudioSources] = useState({}); // Cache base64 audio by chunk index
  
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio element only once
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // Update audio source when chunk index or audio sources change
  useEffect(() => {
    if (textChunks.length === 0) return;
    
    const playCurrentChunk = async () => {
      if (audioSources[currentChunkIndex]) {
        // We already have the audio for this chunk
        if (audioRef.current.src !== audioSources[currentChunkIndex]) {
          audioRef.current.src = audioSources[currentChunkIndex];
        }
        if (isPlaying && !isPaused) {
          audioRef.current.play().catch(e => console.error("Audio play error:", e));
        }
      } else {
        // Need to fetch it
        setIsLoading(true);
        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: textChunks[currentChunkIndex],
              voiceName: 'te-IN-Standard-A' // Or any specific Google voice
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch TTS audio');
          }
          
          const data = await response.json();
          const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
          
          setAudioSources(prev => ({ ...prev, [currentChunkIndex]: audioUrl }));
          
          audioRef.current.src = audioUrl;
          if (isPlaying && !isPaused) {
            audioRef.current.play().catch(e => console.error("Audio play error:", e));
          }
        } catch (error) {
          console.error("TTS fetch error:", error);
          setIsPlaying(false);
          setIsPaused(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    audioRef.current.onended = () => {
      if (currentChunkIndex < textChunks.length - 1) {
        setCurrentChunkIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
      }
    };

    audioRef.current.onerror = (e) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    playCurrentChunk();
  }, [currentChunkIndex, textChunks, isPlaying, isPaused, audioSources]);


  const extractTextFromHtml = (html) => {
    if (typeof window === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // basic cleanup of text
    return (tempDiv.textContent || tempDiv.innerText || '').replace(/\s+/g, ' ').trim();
  };

  const play = () => {
    if (isPaused) {
      audioRef.current.play().catch(e => console.error(e));
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (textChunks.length === 0) {
      const text = extractTextFromHtml(htmlContent);
      if (!text) return;
      const chunks = chunkText(text);
      setTextChunks(chunks);
      setCurrentChunkIndex(0);
    }
    
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  };

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
        <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Listen to Article (Premium Voice)</span>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
        
        {isLoading && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>
            Loading voice...
          </span>
        )}

        {!isPlaying ? (
          <button 
            onClick={play}
            disabled={isLoading}
            style={{
              background: isLoading ? '#ccc' : 'var(--primary-color, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, background 0.2s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              opacity: isLoading ? 0.6 : 1
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
