"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function TrialPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup in this session or ever
    const hasSeenPopup = localStorage.getItem("trial_popup_seen");
    
    if (!hasSeenPopup) {
      // Small delay so it doesn't abruptly show on first paint
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("trial_popup_seen", "true");
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "var(--card-bg, #fff)",
        color: "var(--text-color, #000)",
        padding: "30px",
        borderRadius: "12px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        position: "relative",
        textAlign: "center"
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary, #666)"
          }}
        >
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: "15px", marginTop: "10px", fontSize: "1.5rem" }}>
          Welcome to the Trial Version!
        </h2>
        <p style={{ lineHeight: "1.6", marginBottom: "20px", color: "var(--text-secondary)" }}>
          Enjoy free access to all our content for now. Please note that in the future, we will be transitioning to a subscription-based model.
        </p>
        
        <button 
          onClick={handleClose}
          style={{
            backgroundColor: "var(--primary-color, #3498db)",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%"
          }}
        >
          Got it, Thanks!
        </button>
      </div>
    </div>
  );
}
