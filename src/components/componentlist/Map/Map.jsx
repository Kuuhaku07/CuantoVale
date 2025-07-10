/**
 * Componente MapComponent - Mapa interactivo con marcador
 * 
 * Este componente proporciona un mapa interactivo utilizando la biblioteca pigeon-maps,
 * permitiendo visualizar y seleccionar coordenadas geográficas.
 * 
 * Características principales:
 * - Visualiza un marcador en las coordenadas proporcionadas
 * - Permite seleccionar nuevas coordenadas haciendo clic en el mapa
 * - Soporte para zoom y navegación por el mapa
 * - Altamente configurable mediante props
 * - Modo de solo visualización (no interactivo) disponible
 * 
 * Props:
 * @param {string} coordinates - Coordenadas iniciales en formato "lat, lng" (opcional)
 * @param {function} onChangeCoordinates - Callback al seleccionar nueva ubicación
 * @param {string|number} height - Altura del mapa (ej: "400px" o 500)
 * @param {array} defaultCenter - Centro inicial del mapa [lat, lng] (opcional)
 * @param {number} defaultZoom - Nivel de zoom inicial (opcional)
 * @param {string} markerColor - Color del marcador (opcional)
 * @param {boolean} interactive - Habilita/deshabilita interacción (opcional)
 * 
 * Uso básico:
 * <MapComponent 
 *   coordinates="10.1333, -64.6833"
 *   onChangeCoordinates={handleLocationChange}
 * />
 * 
 * Uso avanzado:
 * <MapComponent
 *   coordinates={savedLocation}
 *   height="500px"
 *   markerColor="#ff0000"
 *   defaultZoom={15}
 *   interactive={false}
 * />
 */


import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Map, Marker } from 'pigeon-maps';

const MapComponent = ({ 
  coordinates, 
  onChangeCoordinates, 
  height = '400px',
  defaultCenter = [10.1333, -64.6833], // Barcelona, Anzoátegui
  defaultZoom = 11,
  markerColor = 'var(--primary-color)',
  interactive = true
}) => {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [marker, setMarker] = useState(null);

  // Parse coordinates more safely
  const parseCoordinates = useCallback((coordString) => {
    if (!coordString) return null;
    
    try {
      const parts = coordString.split(',').map(c => parseFloat(c.trim()));
      if (parts.length === 2 && parts.every(n => !isNaN(n))) {
        return parts;
      }
      return null;
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return null;
    }
  }, []);

  // Handle coordinates change
  useEffect(() => {
    const parsedCoords = parseCoordinates(coordinates);
    if (parsedCoords) {
      setMarker(parsedCoords);
      setCenter(parsedCoords);
    }
  }, [coordinates, parseCoordinates]);

  // Handle map click
  const handleMapClick = useCallback(({ latLng }) => {
    if (!interactive) return;
    
    const roundedCoords = [
      parseFloat(latLng[0].toFixed(6)),
      parseFloat(latLng[1].toFixed(6))
    ];
    
    setMarker(roundedCoords);
    onChangeCoordinates(`${roundedCoords[0]}, ${roundedCoords[1]}`);
  }, [onChangeCoordinates, interactive]);

  // Handle bounds change
  const handleBoundsChanged = useCallback(({ center, zoom }) => {
    setCenter(center);
    setZoom(zoom);
  }, []);

  // Parse height prop to number for pigeon-maps Map component
  const parseHeightToNumber = (h) => {
    if (typeof h === 'number') return h;
    if (typeof h === 'string') {
      const parsed = parseInt(h, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 400; // default fallback
  };

  const mapHeight = parseHeightToNumber(height);

  // Ref and state for container width
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Effect to measure container width on mount and resize
  useEffect(() => {
    const measureWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => {
      window.removeEventListener('resize', measureWidth);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        height, 
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <Map
        center={center}
        zoom={zoom}
        onBoundsChanged={handleBoundsChanged}
        onClick={interactive ? handleMapClick : undefined}
        height={mapHeight}
        width={containerWidth || 400} 
        attribution={false}
      >
        {marker && (
          <Marker 
            anchor={marker} 
            color={markerColor} 
            width={interactive ? 40 : 30}
          />
        )}
      </Map>
    </div>
  );
};

MapComponent.propTypes = {
  coordinates: PropTypes.string, // Format: "lat, lng"
  onChangeCoordinates: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultCenter: PropTypes.arrayOf(PropTypes.number),
  defaultZoom: PropTypes.number,
  markerColor: PropTypes.string,
  interactive: PropTypes.bool
};

MapComponent.defaultProps = {
  onChangeCoordinates: () => {},
  interactive: true
};

export default React.memo(MapComponent);