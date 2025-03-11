
import React, { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Building, X, Navigation } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SearchProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  cities: string[];
  addresses: string[];
  hotelNames: string[];
  onLocationSelect?: (location: string) => void;
  onRadiusChange: (radius: number) => void;
  radius: number;
  onNearMeClick: () => void;
}

const Search: React.FC<SearchProps> = ({
  onSearch,
  searchQuery,
  cities,
  addresses,
  hotelNames,
  onLocationSelect,
  onRadiusChange,
  radius,
  onNearMeClick
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRadiusFilter, setShowRadiusFilter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter cities based on input query
  const filteredCities = cities.filter(
    city => city.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  // Filter addresses based on input query
  const filteredAddresses = addresses.filter(
    address => address.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);
  
  // Filter hotel names based on input query
  const filteredNames = hotelNames.filter(
    name => name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  // Combine suggestions
  const combinedSuggestions = [...filteredCities, ...filteredAddresses, ...filteredNames];

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      setShowSuggestions(true);
      setShowRadiusFilter(true);
    } else {
      setShowSuggestions(false);
      setShowRadiusFilter(false);
      onSearch('');
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowRadiusFilter(true);

    // Trigger location select to center map
    if (onLocationSelect) {
      onLocationSelect(suggestion);
    }

    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowRadiusFilter(!!query);

    // Trigger location select to center map
    if (onLocationSelect && query) {
      onLocationSelect(query);
    }

    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
    setShowRadiusFilter(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Determine if a suggestion is a city
  const isSuggestionCity = (suggestion: string) => {
    return cities.includes(suggestion);
  };

  const handleRadiusChange = (value: number[]) => {
    onRadiusChange(value[0]);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : 'scale-100'
          }`}
      >
        <div className="relative">
          <SearchIcon
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'
              }`}
            size={18}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (query.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for hotels by city, address or name..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 focus-visible:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Near Me button */}
      <button
        onClick={onNearMeClick}
        className="absolute right-[-120px] top-0 h-full flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
      >
        <Navigation size={16} />
        <span>Near Me</span>
      </button>

      {/* Radius filter slider */}
      {showRadiusFilter && (
        <div className="mt-4 px-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Search Radius: {radius} km</span>
          </div>
          <Slider
            defaultValue={[radius]}
            max={50}
            min={1}
            step={1}
            onValueChange={handleRadiusChange}
          />
        </div>
      )}

      {/* Search suggestions */}
      {showSuggestions && combinedSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-background border border-border rounded-xl shadow-lg animate-slide-up overflow-hidden"
        >
          <div className="py-1">
            {combinedSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-muted transition-colors duration-150"
              >
                {isSuggestionCity(suggestion) ? (
                  <MapPin size={16} className="mr-2 text-muted-foreground" />
                ) : (
                  <Building size={16} className="mr-2 text-muted-foreground" />
                )}
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
