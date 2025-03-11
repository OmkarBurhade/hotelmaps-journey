
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import hotelData from '@/data/hotels.json';
import { Hotel } from '@/types/Hotel';
import { toast } from '@/components/ui/use-toast';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import MapSection from './components/MapSection';
import HotelSidebar from './components/HotelSidebar';
import AllHotelsSection from './components/AllHotelsSection';
import Footer from './components/Footer';
import { calculateDistance } from '@/utils/locationUtils';

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
      <Header />

      {/* Main content */}
      <main className="container mx-auto max-w-6xl px-4 pb-16">
        {/* Search and filters section */}
        <SearchSection 
          searchQuery={searchQuery}
          cities={cities}
          addresses={addresses}
          hotelNames={hotelNames}
          radius={searchRadius}
          onSearch={handleSearch}
          onLocationSelect={handleLocationSelect}
          onRadiusChange={handleRadiusChange}
          onNearMeClick={handleNearMe}
        />

        {/* Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map section */}
          <MapSection 
            hotels={hotels}
            filteredHotels={sortedHotels}
            searchQuery={searchQuery}
            focusLocation={focusLocation}
            radius={searchRadius}
            onHotelSelect={handleHotelSelect}
            userLocation={userLocation}
          />

          {/* Sidebar - Hotel results */}
          <HotelSidebar 
            filteredHotels={sortedHotels}
            selectedHotel={selectedHotel}
            onHotelSelect={handleHotelSelect}
            userLocation={userLocation}
          />
        </div>

        {/* Hotel list section for smaller screens */}
        <AllHotelsSection 
          hotels={hotels}
          selectedHotel={selectedHotel}
          onHotelSelect={handleHotelSelect}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Hotel detail modal */}
      {showHotelDetail && selectedHotel && (
        <div>
          {/* Hotel detail component */}
          <div className="relative z-50">
            {showHotelDetail && selectedHotel && (
              <div>
                <div>
                  <div>
                    {/* Hotel detail component */}
                    {React.createElement(
                      require('@/components/HotelDetail').default,
                      {
                        hotel: selectedHotel,
                        onClose: handleCloseDetail
                      }
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
