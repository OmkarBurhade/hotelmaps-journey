
import React from 'react';
import Search from '@/components/Search';
import FilterChip from '@/components/FilterChip';
import { Hotel } from '@/types/Hotel';

interface SearchSectionProps {
  searchQuery: string;
  selectedState: string | null;
  states: string[];
  stateHotelCounts: Record<string, number>;
  hotels: Hotel[];
  handleSearch: (query: string) => void;
  handleStateFilter: (state: string) => void;
  handleLocationSelect: (location: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  selectedState,
  states,
  stateHotelCounts,
  hotels,
  handleSearch,
  handleStateFilter,
  handleLocationSelect,
}) => {
  // Extract unique addresses from hotels
  const addresses = hotels.map(hotel => `${hotel.address} (${hotel.name})`);

  return (
    <div className="animate-on-mount mb-6 opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
      <Search 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        states={states}
        addresses={addresses}
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
  );
};

export default SearchSection;
