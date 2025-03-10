
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
}

const FilterChip: React.FC<FilterChipProps> = ({ 
  label, 
  isSelected, 
  onClick, 
  count 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "text-xs py-0.5 px-1.5 rounded-full", 
          isSelected 
            ? "bg-white/20" 
            : "bg-background"
        )}>
          {count}
        </span>
      )}
      {isSelected && (
        <X size={14} className="ml-1" />
      )}
    </button>
  );
};

export default FilterChip;
