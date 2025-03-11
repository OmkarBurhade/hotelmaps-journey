
import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Hotel } from '../types/Hotel';
import { cn } from '@/lib/utils';

interface HotelCardProps {
  hotel: Hotel;
  onClick: (hotel: Hotel) => void;
  isSelected: boolean;
  distance?: number; // Optional distance from current location/search point
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onClick, isSelected, distance }) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-md cursor-pointer",
        isSelected ? "ring-2 ring-primary shadow-md scale-[1.01]" : "hover:scale-[1.02]"
      )}
      onClick={() => onClick(hotel)}
    >
      {/* Image container with gradient overlay */}
      <div className="relative overflow-hidden h-48">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute bottom-3 left-3 z-20 flex flex-col">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            {hotel.rating}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
            ₹{hotel.price.toLocaleString()}<span className="text-xs text-white/70">/night</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg line-clamp-1">{hotel.name}</h3>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin size={14} className="mr-1" />
              <p className="text-sm line-clamp-1">{hotel.city}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {hotel.description}
        </p>

        {/* Show distance if provided */}
        {distance !== undefined && (
          <div className="mt-2 text-sm font-medium text-primary">
            {distance < 1 ? `${Math.round(distance * 1000)} meters away` : `${distance.toFixed(1)} km away`}
          </div>
        )}

        {/* Amenities */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
              +{hotel.amenities.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
