"use client";

import { useEffect, useState, useRef } from 'react';
import { Languages, Search, ChevronDown } from 'lucide-react';

export default function GoogleTranslate() {
  const [languages, setLanguages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLang, setCurrentLang] = useState('తెలుగు (Telugu)');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Inject Google Translate script if not already present
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'te', autoDisplay: false },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Poll for the native select element to load options
    const intervalId = setInterval(() => {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl && selectEl.options.length > 0) {
        let extractedLangs = Array.from(selectEl.options)
          .map(opt => ({ code: opt.value, name: opt.text }))
          .filter(opt => opt.code !== '' && opt.code !== 'te'); // filter out placeholder and existing te
        
        // Force Telugu to always be the very first option at the top
        extractedLangs.unshift({ code: 'te', name: 'తెలుగు (Telugu)' });
        
        setLanguages(extractedLangs);
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode, langName) => {
    const select = document.querySelector('.goog-te-combo');
    if (!select) return;

    select.value = langCode === 'te' ? '' : langCode;
    select.dispatchEvent(new Event('change'));
    
    setCurrentLang(langName);
    setIsOpen(false);
    setSearchTerm(''); // Reset search on select
  };

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notranslate custom-translate-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Hidden Native Element */}
      <div id="google_translate_element" style={{ opacity: 0, position: 'absolute', zIndex: -1, pointerEvents: 'none' }}></div>

      {/* Custom Button UI */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-color)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
          fontWeight: '500',
          padding: 0
        }}
      >
        <Languages size={18} className="translate-icon" />
        <span>{currentLang}</span>
        <ChevronDown size={16} style={{ color: 'var(--primary-color)' }} />
      </button>

      {/* Custom Searchable Dropdown */}
      {isOpen && (
        <div className="custom-dropdown-menu">
          <div className="search-bar-container">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search languages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>
          <div className="language-list">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  className="language-option"
                  onClick={() => changeLanguage(lang.code, lang.name)}
                >
                  {lang.name}
                </button>
              ))
            ) : (
              <div className="no-results">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
