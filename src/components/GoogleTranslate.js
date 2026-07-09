'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleTranslate() {
  useEffect(() => {
    // Define the global callback function for Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: 'te', // Telugu is the default language of the site
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
        },
        'google_translate_element'
      );
    };
  }, []);

  return (
    <div className="translate-wrapper">
      <div id="google_translate_element"></div>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
    </div>
  );
}
