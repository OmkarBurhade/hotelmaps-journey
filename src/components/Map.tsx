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
  searchQuery: string;
  selectedState: string | null;
  focusLocation: string | null;
  onHotelSelect: (hotel: Hotel) => void;
}

const Map: React.FC<MapProps> = ({
  hotels,
  searchQuery,
  selectedState,
  focusLocation,
  onHotelSelect
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

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

  // Add hotel markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};

    // Filter hotels based on search and selected state
    const filteredHotels = hotels.filter(hotel => {
      const matchesSearch = searchQuery ?
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchQuery.toLowerCase()) : true;

      const matchesState = selectedState ? hotel.state === selectedState : true;

      return matchesSearch && matchesState;
    });

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
  }, [hotels, searchQuery, selectedState, selectedMarker, onHotelSelect]);

  // Focus on a specific location
  useEffect(() => {
    if (!mapRef.current || !focusLocation) return;

    // Try to find hotel by exact address match
    const addressMatch = hotels.find(hotel =>
      `${hotel.address} (${hotel.name})`.toLowerCase() === focusLocation.toLowerCase()
    );

    if (addressMatch) {
      // Focus on specific hotel's coordinates
      mapRef.current.setView([addressMatch.coordinates[0], addressMatch.coordinates[1]], 15, {
        animate: true,
        duration: 1 // Animation duration in seconds
      });

      // Highlight the marker
      setSelectedMarker(addressMatch.id);

      // Slightly delay opening the popup to ensure animation completes
      setTimeout(() => {
        if (markersRef.current[addressMatch.id]) {
          markersRef.current[addressMatch.id].fire('click');
        }
      }, 500);
      return;
    }

    // Try to find state match
    const stateMatch = hotels.find(hotel =>
      hotel.state.toLowerCase() === focusLocation.toLowerCase()
    );

    if (stateMatch) {
      // Get all hotels from this state
      const stateHotels = hotels.filter(hotel => hotel.state === stateMatch.state);
      const bounds = L.latLngBounds(stateHotels.map(hotel => [hotel.coordinates[0], hotel.coordinates[1]]));

      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 1
      });
      return;
    }

    // Try to find city match
    const cityMatch = hotels.find(hotel =>
      hotel.city.toLowerCase() === focusLocation.toLowerCase()
    );

    if (cityMatch) {
      // Get all hotels from this city
      const cityHotels = hotels.filter(hotel => hotel.city === cityMatch.city);
      const bounds = L.latLngBounds(cityHotels.map(hotel => [hotel.coordinates[0], hotel.coordinates[1]]));

      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 1
      });
    }
  }, [focusLocation, hotels]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden " />
  );
};

export default Map;