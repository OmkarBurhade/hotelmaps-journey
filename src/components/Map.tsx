
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotel } from '@/types/Hotel';
import { MapPin } from 'lucide-react';

// Fix for default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapProps {
  hotels: Hotel[];
  filteredHotels: Hotel[];
  searchQuery: string;
  focusLocation: string | null;
  radius: number;
  onHotelSelect: (hotel: Hotel) => void;
  userLocation: [number, number] | null;
}

// Calculate distance between two points using Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const Map: React.FC<MapProps> = ({
  hotels,
  filteredHotels,
  searchQuery,
  focusLocation,
  radius,
  onHotelSelect,
  userLocation
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5); // Center on India

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add hotel markers and radius circle
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};

    // Clear existing circle
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Draw radius circle if we have a center point
    if (mapCenter) {
      circleRef.current = L.circle(mapCenter, {
        color: '#dd5585',
        fillColor: '#dd558533',
        fillOpacity: 0.2,
        radius: radius * 1000, // Convert km to meters
        weight: 1
      }).addTo(mapRef.current);
    }

    // Add markers for filtered hotels
    filteredHotels.forEach(hotel => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container ${selectedMarker === hotel.id ? 'selected' : ''}">
            <div
              class="marker-icon-container bg-[#dd5585] shadow-md text-background flex flex-col justify-center items-center w-fit p-[0.35rem] rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="marker-tooltip">${hotel.name}</div>
          </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([hotel.coordinates[0], hotel.coordinates[1]], {
        icon: customIcon,
        title: hotel.name
      }).addTo(mapRef.current as L.Map);

      marker.on('click', () => {
        setSelectedMarker(hotel.id);
        onHotelSelect(hotel);
      });

      markersRef.current[hotel.id] = marker;
    });

    // Add CSS for markers
    if (!document.getElementById('marker-styles')) {
      const style = document.createElement('style');
      style.id = 'marker-styles';
      style.innerHTML = `
          .custom-marker {
          background: transparent;
          border: none;
          }
          .marker-container {
          position: relative;
          transition: transform 0.2s ease-out;
          }
          .marker-container:hover, .marker-container.selected {
          transform: scale(1.2);
          z-index: 1000;
          }
          .marker-tooltip {
          display: none;
          position: absolute;
          bottom: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          border: 1px solid #ccc;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .marker-container:hover .marker-tooltip {
          display: block;
          }
          `;
      document.head.appendChild(style);
    }

    // Fit map bounds to markers if we have any filtered hotels
    if (filteredHotels.length > 0) {
      const bounds = L.latLngBounds(filteredHotels.map(hotel => [hotel.coordinates[0], hotel.coordinates[1]]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [filteredHotels, selectedMarker, onHotelSelect, mapCenter, radius]);

  // Add user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Create user location marker
    const customIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="user-marker-container">
          <div class="user-marker-icon bg-blue-500 shadow-md text-white flex items-center justify-center rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarkerRef.current = L.marker(userLocation, {
      icon: customIcon,
      title: "Your Location"
    }).addTo(mapRef.current);

    // Set map center to user location
    setMapCenter(userLocation);
    mapRef.current.setView(userLocation, 12);
  }, [userLocation]);

  // Focus on a specific location
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return;

    // Try to find hotel by name
    const nameMatch = hotels.find(hotel =>
      hotel.name.trim().toLowerCase() === focusLocation.trim().toLowerCase()
    );

    if (nameMatch) {
      // Focus on specific hotel's coordinates
      const coords: [number, number] = [nameMatch.coordinates[0], nameMatch.coordinates[1]];
      setMapCenter(coords);
      mapRef.current.setView(coords, 15, {
        animate: true,
        duration: 1 // Animation duration in seconds
      });

      // Highlight the marker
      setSelectedMarker(nameMatch.id);

      // Slightly delay opening the popup to ensure animation completes
      setTimeout(() => {
        if (markersRef.current[nameMatch.id]) {
          markersRef.current[nameMatch.id].fire('click');
        }
      }, 500);
      return;
    }

    // Try to find hotel by exact address match
    const addressMatch = hotels.find(hotel =>
      hotel.address.toLowerCase().includes(focusLocation.toLowerCase())
    );

    if (addressMatch) {
      // Focus on specific hotel's coordinates
      const coords: [number, number] = [addressMatch.coordinates[0], addressMatch.coordinates[1]];
      setMapCenter(coords);
      mapRef.current.setView(coords, 15, {
        animate: true,
        duration: 1 // Animation duration in seconds
      });

      // Highlight the marker
      setSelectedMarker(addressMatch.id);
      return;
    }

    // Try to find city match
    const cityMatch = hotels.find(hotel =>
      hotel.city.toLowerCase() === focusLocation.toLowerCase()
    );

    if (cityMatch) {
      // Get all hotels from this city
      const cityHotels = hotels.filter(hotel => hotel.city.toLowerCase() === focusLocation.toLowerCase());
      const bounds = L.latLngBounds(cityHotels.map(hotel => [hotel.coordinates[0], hotel.coordinates[1]]));
      
      // Set the map center to the center of the city
      const centerLat = cityMatch.coordinates[0];
      const centerLng = cityMatch.coordinates[1];
      setMapCenter([centerLat, centerLng]);
      
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 1
      });
    }
  }, [focusLocation, hotels]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" />
  );
};

export default Map;
