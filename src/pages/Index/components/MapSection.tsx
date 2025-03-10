
import React from 'react';
import Map from '@/components/Map';
import { Hotel } from '@/types/Hotel';

interface MapSectionProps {
  hotels: Hotel[];
  searchQuery: string;
  selectedState: string | null;
  onHotelSelect: (hotel: Hotel) => void;
  focusLocation: string | null;
}

const MapSection: React.FC<MapSectionProps> = ({
  hotels,
  searchQuery,
  selectedState,
  onHotelSelect,
  focusLocation
}) => {
  return (
    <div className="lg:col-span-2 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
      <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
        <Map 
          hotels={hotels} 
          searchQuery={searchQuery}
          selectedState={selectedState}
          onHotelSelect={onHotelSelect}
          focusLocation={focusLocation}
        />
      </div>
    </div>
  );
};

export default MapSection;
