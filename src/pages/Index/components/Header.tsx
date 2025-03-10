
import React from 'react';

const Header = () => {
  return (
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
  );
};

export default Header;
