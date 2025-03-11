
import React from 'react';
import Search from '@/components/Search';
import FilterChip from '@/components/FilterChip';
import { Hotel } from '@/types/Hotel';

interface SearchSectionProps {
  searchQuery: string;
  cities: string[];
  addresses: string[];
  hotelNames: string[];
  radius: number;
  onSearch: (query: string) => void;
  onLocationSelect: (location: string) => void;
  onRadiusChange: (radius: number) => void;
  onNearMeClick: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  cities,
  addresses,
  hotelNames,
  radius,
  onSearch,
  onLocationSelect,
  onRadiusChange,
  onNearMeClick
}) => {
  return (
    <div className="animate-on-mount mb-6 opacity-0 transform translate-y-4 transition-all duration-700 relative z-10" style={{ transitionDelay: '200ms' }}>
      <Search 
        onSearch={onSearch}
        searchQuery={searchQuery}
        cities={cities}
        addresses={addresses}
        hotelNames={hotelNames}
        onLocationSelect={onLocationSelect}
        onRadiusChange={onRadiusChange}
        radius={radius}
        onNearMeClick={onNearMeClick}
      />
    </div>
  );
};

export default SearchSection;
