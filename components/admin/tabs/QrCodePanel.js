'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodePanel() {
  const canvasRef = useRef(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(origin);
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, origin, {
        width: 200,
        margin: 1,
        color: { dark: '#2b1d10', light: '#f1e3c2' }
      });
    }
  }, []);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'gaesteseite-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="panel">
      <p className="panel-title">Gästezugang</p>
      <div className="qr-panel-body">
        <canvas ref={canvasRef} className="qr-canvas" />
        <div>
          <p className="mt-0">Gäste erreichen die Seite über:</p>
          <p className="qr-url">{url || '…'}</p>
          <button type="button" className="btn btn-gold btn-sm" onClick={download}>
            QR-Code herunterladen
          </button>
        </div>
      </div>
    </div>
  );
}
