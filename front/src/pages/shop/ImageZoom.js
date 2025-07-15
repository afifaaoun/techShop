import React, { useState, useRef } from 'react';

export default function ImageZoom({ src, zoomSrc, width = 300, height = 300, zoomWidth = 400, zoomHeight = 400 }) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef();

  // Taille du carré loupe (zone grise)
  const lensSize = 100;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculer la position de la loupe en centrant sur la souris
    let x = mouseX - lensSize / 2;
    let y = mouseY - lensSize / 2;

    // Limiter la loupe dans les limites de l'image
    const maxX = rect.width - lensSize;
    const maxY = rect.height - lensSize;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
    setZoomPos({ x: 0, y: 0 });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Conteneur image principale avec loupe */}
      <div
        ref={containerRef}
        style={{ 
          position: 'relative', 
          width, 
          height, 
          border: '1px solid #ccc',
          overflow: 'hidden'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <img
          src={src}
          alt="Produit"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            display: 'block',
            userSelect: 'none'
          }}
        />

        {/* Cadre loupe gris semi-transparent */}
        {showZoom && (
          <div
            style={{
              position: 'absolute',
              top: zoomPos.y,
              left: zoomPos.x,
              width: lensSize,
              height: lensSize,
              backgroundColor: 'rgba(128,128,128,0.4)',
              border: '1px solid #888',
              pointerEvents: 'none',
              zIndex: 10,
              borderRadius: '2px'
            }}
          />
        )}
      </div>

      {/* Image zoomée - Position à gauche de la page */}
      {showZoom && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '-420px', 
            transform: 'translateY(-50%)',
            width: zoomWidth,
            height: zoomHeight,
            border: '2px solid rgba(129, 104, 104, 0.3)',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(129, 104, 104, 0.3)',
            zIndex: 1000,
            backgroundImage: `url(${zoomSrc || src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${width * (zoomWidth / lensSize)}px ${height * (zoomHeight / lensSize)}px`,
            backgroundPositionX: `-${(zoomPos.x * zoomWidth) / lensSize}px`,
            backgroundPositionY: `-${(zoomPos.y * zoomHeight) / lensSize}px`,
            transition: 'background-position 0.1s ease-out'
          }}
        />
      )}
    </div>
  );
}
