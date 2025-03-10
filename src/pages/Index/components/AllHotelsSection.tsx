
import React from 'react';
import HotelCard from '@/components/HotelCard';
import { Hotel } from '@/types/Hotel';

interface AllHotelsSectionProps {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onHotelSelect: (hotel: Hotel) => void;
}

const AllHotelsSection: React.FC<AllHotelsSectionProps> = ({
  hotels,
  selectedHotel,
  onHotelSelect
}) => {
  return (
    <div className="mt-8 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '500ms' }}>
      <h2 className="text-2xl font-bold mb-6">All Hotels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            onClick={onHotelSelect}
            isSelected={selectedHotel?.id === hotel.id}
          />
        ))}
      </div>
    </div>
  );
};

export default AllHotelsSection;
