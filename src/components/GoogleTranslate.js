"use client";

import { useEffect, useState, useRef } from 'react';
import { Globe, X } from 'lucide-react';

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Check if script is already injected
    if (document.getElementById('google-translate-script')) return;

    // Google Translate initialization function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'te', autoDisplay: false },
        'google_translate_element'
      );
    };

    // Inject the script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    const select = document.querySelector('.goog-te-combo');
    if (!select) return;
    
    // Set the select value to the language code or empty string for original
    select.value = langCode === 'te' ? '' : langCode;
    
    // Dispatch a change event so the Google script picks it up
    select.dispatchEvent(new Event('change'));
    setIsOpen(false);
  };

  return (
    <>
      {/* Hidden native widget */}
      <div 
        id="google_translate_element" 
        style={{ opacity: 0, position: 'absolute', zIndex: -1, pointerEvents: 'none' }}
      ></div>

      {/* Floating Action Button & Menu */}
      <div 
        ref={menuRef}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px'
        }}
        className="notranslate"
      >
        {/* Popup Menu */}
        {isOpen && (
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: 'var(--shadow-glass)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '140px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <button 
              onClick={() => changeLanguage('te')}
              style={{
                background: 'none', border: 'none', padding: '12px 16px', 
                textAlign: 'left', cursor: 'pointer', color: 'var(--text-color)',
                borderRadius: '8px', fontWeight: '500', transition: 'var(--transition)'
              }}
              className="lang-btn"
            >
              తెలుగు (Telugu)
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              style={{
                background: 'none', border: 'none', padding: '12px 16px', 
                textAlign: 'left', cursor: 'pointer', color: 'var(--text-color)',
                borderRadius: '8px', fontWeight: '500', transition: 'var(--transition)'
              }}
              className="lang-btn"
            >
              English
            </button>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Translate Page"
        >
          {isOpen ? <X size={24} /> : <Globe size={24} />}
        </button>
      </div>
    </>
  );
}
