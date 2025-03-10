
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotel } from '../types/Hotel';

// Fix Leaflet marker icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom hotel marker icon
const hotelIcon = L.icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

interface MapProps {
  hotels: Hotel[];
  searchQuery: string;
  selectedState: string | null;
  onHotelSelect: (hotel: Hotel) => void;
  focusLocation?: string;
}

const Map: React.FC<MapProps> = ({ hotels, searchQuery, selectedState, onHotelSelect, focusLocation }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize map on component mount
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 78.9], // Center of India
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
      });

      // Add tile layer with clean, minimal design
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add scale control
      L.control.scale({
        imperial: false,
        position: 'bottomright'
      }).addTo(map);

      mapRef.current = map;
      setIsMapInitialized(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when hotels, search query, or selected state changes
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter hotels based on search query and selected state
    const filteredHotels = hotels.filter(hotel => {
      const matchesSearch = searchQuery ? 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hotel.state.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      
      const matchesState = selectedState ? hotel.state === selectedState : true;
      
      return matchesSearch && matchesState;
    });

    // Add new markers for filtered hotels
    const markers = filteredHotels.map(hotel => {
      const marker = L.marker([hotel.coordinates[0], hotel.coordinates[1]], { icon: hotelIcon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div class="font-semibold">${hotel.name}</div>
           <div class="text-sm text-muted-foreground">${hotel.city}, ${hotel.state}</div>
           <div class="text-sm mt-1">₹${hotel.price} per night</div>`
        )
        .on('click', () => {
          onHotelSelect(hotel);
        });
      
      return marker;
    });

    markersRef.current = markers;

    // Fit bounds if there are filtered hotels
    if (filteredHotels.length > 0) {
      const bounds = L.latLngBounds(filteredHotels.map(hotel => [hotel.coordinates[0], hotel.coordinates[1]]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [hotels, searchQuery, selectedState, isMapInitialized, onHotelSelect]);

  // Handle focus on a specific location when focusLocation changes
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized || !focusLocation) return;

    // Find hotels in the specified location (state)
    const hotelsInLocation = hotels.filter(hotel => 
      hotel.state.toLowerCase() === focusLocation.toLowerCase() ||
      hotel.city.toLowerCase() === focusLocation.toLowerCase()
    );

    if (hotelsInLocation.length > 0) {
      // Create bounds from all matching hotels
      const bounds = L.latLngBounds(hotelsInLocation.map(hotel => [hotel.coordinates[0], hotel.coordinates[1]]));
      
      // Animate to the bounds
      mapRef.current.flyToBounds(bounds, {
        padding: [50, 50],
        maxZoom: 10,
        duration: 1.5
      });
      
      // Highlight markers by opening popups for the focused location
      markersRef.current.forEach(marker => {
        const latLng = marker.getLatLng();
        const inBounds = bounds.contains(latLng);
        if (inBounds) {
          setTimeout(() => {
            marker.openPopup();
          }, 1800); // Wait for the animation to complete
        }
      });
    }
  }, [focusLocation, hotels, isMapInitialized]);

  return (
    <div className="map-container w-full h-full rounded-2xl overflow-hidden border border-border/50 bg-card">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-10"
        style={{ minHeight: '500px' }}
      />
      <div className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 shadow-sm">
        <p className="text-sm font-medium">
          {searchQuery || selectedState ? 
            `Showing ${markersRef.current.length} hotels` : 
            'Explore hotels across India'}
        </p>
      </div>
    </div>
  );
};

export default Map;
