
import React from 'react';
import Search from '@/components/Search';
import FilterChip from '@/components/FilterChip';

interface SearchSectionProps {
  searchQuery: string;
  handleSearch: (query: string) => void;
  handleLocationSelect: (location: string) => void;
  states: string[];
  selectedState: string | null;
  handleStateFilter: (state: string) => void;
  stateHotelCounts: Record<string, number>;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  handleSearch,
  handleLocationSelect,
  states,
  selectedState,
  handleStateFilter,
  stateHotelCounts
}) => {
  return (
    <div className="animate-on-mount mb-6 opacity-0 transform translate-y-4 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
      <Search 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        states={states}
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
