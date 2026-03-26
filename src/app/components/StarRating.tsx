import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, reviewCount, size = 'sm' }: StarRatingProps) {
  const starSize = size === 'sm' ? 13 : 16;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = !filled && star === Math.ceil(rating) && rating % 1 !== 0;
          return (
            <span key={star} className="relative inline-block">
              <Star
                size={starSize}
                className="text-gray-200"
                fill="currentColor"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
                >
                  <Star size={starSize} className="text-amber-400" fill="currentColor" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className={`text-amber-600 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

interface StarPickerProps {
  value: number;
  onChange: (rating: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={star <= value ? 'text-amber-400' : 'text-gray-300'}
            fill="currentColor"
          />
        </button>
      ))}
    </div>
  );
}
