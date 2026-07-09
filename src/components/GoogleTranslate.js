'use client';
import { useEffect } from 'react';

export default function GoogleTranslate() {
  useEffect(() => {
    // Only load the script if it hasn't been loaded yet
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: 'te',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
          },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div id="google_translate_element"></div>
  );
}
