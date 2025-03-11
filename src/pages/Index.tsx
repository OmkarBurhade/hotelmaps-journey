
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Search from '@/components/Search';
import Map from '@/components/Map';
import HotelCard from '@/components/HotelCard';
import HotelDetail from '@/components/HotelDetail';
import FilterChip from '@/components/FilterChip';
import hotelData from '@/data/hotels.json';
import { Hotel } from '@/types/Hotel';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Function to calculate distance between two coordinates
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [focusLocation, setFocusLocation] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hotelsWithDistance, setHotelsWithDistance] = useState<(Hotel & { distance?: number })[]>([]);
  
  const hotels = useMemo(() => hotelData.hotels as Hotel[], []);

  // Get unique cities from hotels
  const cities = useMemo(() => {
    const citySet = new Set(hotels.map(hotel => hotel.city));
    return Array.from(citySet);
  }, [hotels]);

  // Extract addresses from hotels
  const addresses = useMemo(() => {
    return hotels.map(hotel => `${hotel.address}`);
  }, [hotels]);

  // Extract hotel names
  const hotelNames = useMemo(() => {
    return hotels.map(hotel => `${hotel.name.trim()}`);
  }, [hotels]);

  // Calculate distances when user location changes
  useEffect(() => {
    if (userLocation) {
      const hotelsWithDist = hotels.map(hotel => ({
        ...hotel,
        distance: calculateDistance(
          userLocation[0], 
          userLocation[1], 
          hotel.coordinates[0], 
          hotel.coordinates[1]
        )
      }));
      setHotelsWithDistance(hotelsWithDist);
    } else {
      setHotelsWithDistance(hotels);
    }
  }, [hotels, userLocation]);

  // Filter hotels based on search query and radius
  const filteredHotels = useMemo(() => {
    let filtered = hotelsWithDistance;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hotel.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by distance if we have a search center
    if ((searchQuery || userLocation) && filtered.some(h => h.distance !== undefined)) {
      filtered = filtered.filter(hotel => 
        hotel.distance !== undefined && hotel.distance <= searchRadius
      );
    }
    
    return filtered;
  }, [hotelsWithDistance, searchQuery, searchRadius, userLocation]);

  // Sort hotels by distance when in "Near Me" mode
  const sortedHotels = useMemo(() => {
    if (userLocation) {
      return [...filteredHotels].sort((a, b) => {
        return (a.distance || Infinity) - (b.distance || Infinity);
      });
    }
    return filteredHotels;
  }, [filteredHotels, userLocation]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // If searching for a city, find its coordinates and set as search center
    if (query) {
      const cityMatch = hotels.find(hotel => 
        hotel.city.toLowerCase() === query.toLowerCase()
      );
      
      if (cityMatch) {
        // Use the city's coordinates as the search center
        setUserLocation(null); // Clear user location to focus on search
      } else {
        // If it's not a city, look for exact hotel or address match
        const exactMatch = hotels.find(hotel => 
          hotel.name.toLowerCase() === query.toLowerCase() ||
          hotel.address.toLowerCase().includes(query.toLowerCase())
        );
        
        if (exactMatch) {
          setUserLocation(null); // Clear user location to focus on search
        }
      }
    } else {
      // If query is cleared, reset
      setUserLocation(null);
    }
  };

  // Handle location select to focus map
  const handleLocationSelect = (location: string) => {
    setFocusLocation(location);
    
    // Show success toast
    toast({
      title: "Location focused",
      description: `Map centered on "${location}"`,
      duration: 3000,
    });
    
    // Reset focus after a delay to allow future searches of the same location
    setTimeout(() => {
      setFocusLocation(null);
    }, 2000);
  };

  // Handle Near Me button click
  const handleNearMe = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(userCoords);
          setSearchQuery('');
          
          toast({
            title: "Location detected",
            description: "Showing hotels near your current location",
            duration: 3000,
          });
        },
        (error) => {
          console.error(error);
          toast({
            title: "Location error",
            description: "Unable to get your location. Please check permissions.",
            variant: "destructive",
            duration: 5000,
          });
        }
      );
    } else {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, []);

  // Handle radius change
  const handleRadiusChange = (radius: number) => {
    setSearchRadius(radius);
  };

  // Handle hotel selection
  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowHotelDetail(true);
  };

  // Close hotel detail modal
  const handleCloseDetail = () => {
    setShowHotelDetail(false);
  };

  // Apply fade-in animation to elements when component mounts
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((element, index) => {
      setTimeout(() => {
        (element as HTMLElement).style.opacity = '1';
        (element as HTMLElement).style.transform = 'translateY(0)';
      }, 100 * (index + 1));
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="animate-on-mount px-4 py-8 md:py-12 opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '100ms' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
              Discover Your Perfect Stay
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              Find Hotels Across India
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Explore a curated selection of premier hotels across India,
              each offering a unique experience tailored to your preferences.
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto max-w-6xl px-4 pb-16">
        {/* Search and filters section */}
        <div className="animate-on-mount mb-6 opacity-0 transform translate-y-4 transition-all duration-700 relative z-10" style={{ transitionDelay: '200ms' }}>
          <Search 
            onSearch={handleSearch}
            searchQuery={searchQuery}
            cities={cities}
            addresses={addresses}
            hotelNames={hotelNames}
            onLocationSelect={handleLocationSelect}
            onRadiusChange={handleRadiusChange}
            radius={searchRadius}
            onNearMeClick={handleNearMe}
          />
          
          {/* Current filter indicator */}
          {userLocation && (
            <div className="flex items-center gap-2 mt-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm w-fit">
              <Navigation size={14} />
              <span>Showing hotels within {searchRadius} km of your location</span>
            </div>
          )}
          
          {searchQuery && (
            <div className="flex items-center gap-2 mt-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm w-fit">
              <MapPin size={14} />
              <span>Showing hotels near "{searchQuery}" within {searchRadius} km</span>
            </div>
          )}
        </div>

        {/* Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map section */}
          <div className="lg:col-span-2 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
            <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
              <Map 
                hotels={hotels}
                filteredHotels={sortedHotels}
                searchQuery={searchQuery}
                focusLocation={focusLocation}
                radius={searchRadius}
                onHotelSelect={handleHotelSelect}
                userLocation={userLocation}
              />
            </div>
          </div>

          {/* Sidebar - Hotel results */}
          <div className="animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '400ms' }}>
            <div className="bg-card rounded-2xl border border-border/50 h-[500px] md:h-[600px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">Hotels</h2>
                  <span className="text-sm text-muted-foreground">
                    {sortedHotels.length} results
                  </span>
                </div>
                {userLocation && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Navigation size={14} className="mr-1" />
                    <span>Near your location</span>
                  </div>
                )}
                {searchQuery && !userLocation && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    <span>Near {searchQuery}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sortedHotels.length > 0 ? (
                  sortedHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onClick={handleHotelSelect}
                      isSelected={selectedHotel?.id === hotel.id}
                      distance={hotel.distance}
                    />
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
        </div>

        {/* Hotel list section for smaller screens */}
        <div className="mt-8 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '500ms' }}>
          <h2 className="text-2xl font-bold mb-6">All Hotels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => {
              const hotelWithDist = hotelsWithDistance.find(h => h.id === hotel.id);
              return (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onClick={handleHotelSelect}
                  isSelected={selectedHotel?.id === hotel.id}
                  distance={hotelWithDist?.distance}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hotel Explorer. All hotels and images are for demonstration purposes.
          </p>
        </div>
      </footer>

      {/* Hotel detail modal */}
      {showHotelDetail && selectedHotel && (
        <HotelDetail
          hotel={selectedHotel}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Index;
