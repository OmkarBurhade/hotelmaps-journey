
import React from 'react';
import { X, Star, MapPin, Wifi, Coffee, Dumbbell, Utensils, Waves } from 'lucide-react';
import { Hotel } from '../types/Hotel';

interface HotelDetailProps {
  hotel: Hotel;
  onClose: () => void;
}

// Map of amenities to icons
const amenityIcons: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi size={14} />,
  'Restaurant': <Utensils size={14} />,
  'Gym': <Dumbbell size={14} />,
  'Swimming Pool': <Waves size={14} />,
  'Bar': <Coffee size={14} />,
};

const HotelDetail: React.FC<HotelDetailProps> = ({ hotel, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
          <img 
            src={hotel.images[0]} 
            alt={hotel.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors duration-200"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-4 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-xs font-medium mb-2">
              <Star size={14} className="fill-yellow-400 text-yellow-400" /> 
              {hotel.rating}
            </span>
            <h2 className="text-white text-2xl font-semibold">{hotel.name}</h2>
            <div className="flex items-center text-white/90 mt-1">
              <MapPin size={16} className="mr-1" />
              <p className="text-sm">{hotel.address}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">About</h3>
              <span className="text-lg font-semibold">₹{hotel.price.toLocaleString()}<span className="text-sm text-muted-foreground">/night</span></span>
            </div>
            <p className="text-muted-foreground">{hotel.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities.map((amenity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-secondary"
                >
                  {amenityIcons[amenity] || <div className="w-3.5 h-3.5" />}
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Location</h3>
            <div className="h-48 rounded-lg overflow-hidden border border-border">
              <img 
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${hotel.coordinates[0]},${hotel.coordinates[1]}&zoom=14&size=600x200&markers=color:red%7C${hotel.coordinates[0]},${hotel.coordinates[1]}&key=AIzaSyBPHVKb1A3UK_cXFajCVwLIJfAGtuSKLMM`}
                alt="Hotel location" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Map preview requires API key</p>
              </div>
            </div>
          </div> */}  
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-card">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
