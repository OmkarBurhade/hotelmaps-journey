
import React, { useState, useEffect, useMemo } from 'react';
import Search from '@/components/Search';
import Map from '@/components/Map';
import HotelCard from '@/components/HotelCard';
import HotelDetail from '@/components/HotelDetail';
import FilterChip from '@/components/FilterChip';
import hotelData from '@/data/hotels.json';
import { Hotel } from '@/types/Hotel';
import { MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [focusLocation, setFocusLocation] = useState<string | null>(null);
  const hotels = useMemo(() => hotelData.hotels as Hotel[], []);

  // Get unique states from hotels
  const states = useMemo(() => {
    const stateSet = new Set(hotels.map(hotel => hotel.state));
    return Array.from(stateSet);
  }, [hotels]);

  // Extract addresses from hotels
  const addresses = useMemo(() => {
    return hotels.map(hotel => `${hotel.address}`);
  }, [hotels]);

  // Extract addresses from hotels
  const hotelNames = useMemo(() => {
    return hotels.map(hotel => ` ${hotel.name}`);
  }, [hotels]);

  // Count hotels by state
  const stateHotelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    hotels.forEach(hotel => {
      counts[hotel.state] = (counts[hotel.state] || 0) + 1;
    });
    return counts;
  }, [hotels]);

  // Filter hotels based on search query and selected state
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = searchQuery ? 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hotel.state.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      
      const matchesState = selectedState ? hotel.state === selectedState : true;
      
      return matchesSearch && matchesState;
    });
  }, [hotels, searchQuery, selectedState]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // If the query exactly matches a state name, set it as selected state
    const matchingState = states.find(
      state => state.toLowerCase() === query.toLowerCase()
    );
    
    if (matchingState) {
      setSelectedState(matchingState);
    } else if (!query) {
      setSelectedState(null);
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

  // Handle state filter click
  const handleStateFilter = (state: string) => {
    if (selectedState === state) {
      setSelectedState(null);
    } else {
      setSelectedState(state);
      setSearchQuery(state);
      setFocusLocation(state); // Also focus the map on the selected state
    }
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
              Explore a curated selection of premier hotels across Maharashtra, Delhi, Gujarat, and Uttar Pradesh,
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
            states={states}
            addresses={addresses}
            hotelNames={hotelNames}
            onLocationSelect={handleLocationSelect}
          />
          
          {/* State filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {states.map((state) => (
              <FilterChip
                key={state}
                label={state}
                isSelected={selectedState === state}
                onClick={() => handleStateFilter(state)}
                count={stateHotelCounts[state]}
              />
            ))}
          </div>
        </div>

        {/* Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map section */}
          <div className="lg:col-span-2 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '300ms' }}>
            <div className="h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
              <Map 
                hotels={hotels} 
                searchQuery={searchQuery}
                selectedState={selectedState}
                onHotelSelect={handleHotelSelect}
                focusLocation={focusLocation}
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
                      onClick={handleHotelSelect}
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
        </div>

        {/* Hotel list section for smaller screens */}
        <div className="mt-8 animate-on-mount opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '500ms' }}>
          <h2 className="text-2xl font-bold mb-6">All Hotels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onClick={handleHotelSelect}
                isSelected={selectedHotel?.id === hotel.id}
              />
            ))}
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
