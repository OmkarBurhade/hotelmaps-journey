
import React from 'react';
import Map from '@/components/Map';
import { Hotel } from '@/types/Hotel';

interface MapSectionProps {
  hotels: Hotel[];
  filteredHotels: Hotel[];
  searchQuery: string;
  focusLocation: string | null;
  radius: number;
  onHotelSelect: (hotel: Hotel) => void;
  userLocation: [number, number] | null;
}

const MapSection: React.FC<MapSectionProps> = ({
  hotels,
  filteredHotels,
  searchQuery,
  focusLocation,
  radius,
  onHotelSelect,
  userLocation
}) => {
  return (
    <div className="lg:col-span-2 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
      <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
        <Map 
          hotels={hotels}
          filteredHotels={filteredHotels}
          searchQuery={searchQuery}
          focusLocation={focusLocation}
          radius={radius}
          onHotelSelect={onHotelSelect}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
};

export default MapSection;
