'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodePanel({
  path = '',
  title = 'Gästezugang',
  intro = 'Gäste erreichen die Seite über:',
  filename = 'gaesteseite-qr.png'
}) {
  const canvasRef = useRef(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const target = `${window.location.origin}${path}`;
    setUrl(target);
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, target, {
        width: 200,
        margin: 1,
        color: { dark: '#2b1d10', light: '#f1e3c2' }
      });
    }
  }, [path]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="panel">
      <p className="panel-title">{title}</p>
      <div className="qr-panel-body">
        <canvas ref={canvasRef} className="qr-canvas" />
        <div>
          <p className="mt-0">{intro}</p>
          <p className="qr-url">{url || '…'}</p>
          <button type="button" className="btn btn-gold btn-sm" onClick={download}>
            QR-Code herunterladen
          </button>
        </div>
      </div>
    </div>
  );
}
