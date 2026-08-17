"use client";
import { useEffect } from 'react';

export default function AdBanner({ dataAdSlot, dataAdFormat = "auto", dataFullWidthResponsive = "true" }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // Only render if the publisher ID is set
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !dataAdSlot) return null;

  return (
    <div style={{ margin: '30px auto', textAlign: 'center', overflow: 'hidden', minHeight: '100px' }}>
      <ins className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}></ins>
    </div>
  );
}
