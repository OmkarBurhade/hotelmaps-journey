
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Hotel Explorer. All hotels and images are for demonstration purposes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
