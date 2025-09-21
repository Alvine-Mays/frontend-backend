import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

const StarRating = ({ value = 0, showNumber = true, className }) => {
  const rating = typeof value === 'number' && !isNaN(value) ? Math.max(0, Math.min(5, value)) : 0;
  const filled = Math.round(rating);
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={cn('w-4 h-4', i <= filled ? 'text-blue-primary fill-current' : 'text-gray-300')} />
      ))}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
