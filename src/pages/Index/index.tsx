import React, { useState, useEffect, useMemo } from 'react';
import hotelData from '@/data/hotels.json';
import { Hotel } from '@/types/Hotel';
import { toast } from '@/components/ui/use-toast';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import MapSection from './components/MapSection';
import HotelSidebar from './components/HotelSidebar';
import AllHotelsSection from './components/AllHotelsSection';
import Footer from './components/Footer';

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
      <Header />

      {/* Main content */}
      <main className="container mx-auto max-w-6xl px-4 pb-16">
        {/* Search and filters section */}
        <SearchSection 
          searchQuery={searchQuery}
          selectedState={selectedState}
          states={states}
          stateHotelCounts={stateHotelCounts}
          hotels={hotels}
          handleSearch={handleSearch}
          handleStateFilter={handleStateFilter}
          handleLocationSelect={handleLocationSelect}
        />

        {/* Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map section */}
          <MapSection 
            hotels={hotels}
            searchQuery={searchQuery}
            selectedState={selectedState}
            focusLocation={focusLocation}
            onHotelSelect={handleHotelSelect}
          />

          {/* Sidebar - Hotel results */}
          <HotelSidebar 
            filteredHotels={filteredHotels}
            selectedState={selectedState}
            selectedHotel={selectedHotel}
            onHotelSelect={handleHotelSelect}
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
