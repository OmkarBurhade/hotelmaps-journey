
import React from 'react';
import { Hotel } from '@/types/Hotel';
import { Navigation, MapPin } from 'lucide-react';

interface HotelSidebarProps {
  filteredHotels: (Hotel & { distance?: number })[];
  selectedHotel: Hotel | null;
  onHotelSelect: (hotel: Hotel) => void;
  userLocation?: [number, number] | null;
}

const HotelSidebar: React.FC<HotelSidebarProps> = ({
  filteredHotels,
  selectedHotel,
  onHotelSelect,
  userLocation
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
          {userLocation && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Navigation size={14} className="mr-1" />
              <span>Near your location</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => onHotelSelect(hotel)}
                className={`border p-4 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                  selectedHotel?.id === hotel.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <h3 className="font-medium">{hotel.name}</h3>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin size={14} className="mr-1" />
                  <p className="text-sm">{hotel.city}</p>
                </div>
                {hotel.distance !== undefined && (
                  <div className="mt-2 text-sm font-medium text-primary">
                    {hotel.distance < 1 ? `${Math.round(hotel.distance * 1000)} meters away` : `${hotel.distance.toFixed(1)} km away`}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-3">
                <MapPin size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No hotels found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your search or increasing the radius to find more hotels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSidebar;
