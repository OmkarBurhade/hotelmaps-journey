
import React from 'react';
import HotelCard from '@/components/HotelCard';
import { Hotel } from '@/types/Hotel';
import { MapPin } from 'lucide-react';

interface HotelSidebarProps {
  filteredHotels: Hotel[];
  selectedState: string | null;
  selectedHotel: Hotel | null;
  onHotelSelect: (hotel: Hotel) => void;
}

const HotelSidebar: React.FC<HotelSidebarProps> = ({
  filteredHotels,
  selectedState,
  selectedHotel,
  onHotelSelect
}) => {
  return (
    <div className="animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '400ms' }}>
      <div className="bg-card rounded-2xl border border-border/50 h-[500px] md:h-[600px] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Hotels</h2>
            <span className="text-sm text-muted-foreground">
              {filteredHotels.length} results
            </span>
          </div>
          {selectedState && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <MapPin size={14} className="mr-1" />
              <span>{selectedState}</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onClick={onHotelSelect}
                isSelected={selectedHotel?.id === hotel.id}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-3">
                <MapPin size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No hotels found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSidebar;
