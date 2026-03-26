import { useNavigate } from 'react-router';
import { StarRating } from './StarRating';
import type { Product } from '../data/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
            {product.condition}
          </span>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-gray-900 text-sm leading-snug line-clamp-2 mb-2" style={{ fontWeight: 600 }}>
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: '#1B3A6B' }}>
            {product.sellerAvatar}
          </div>
          <span className="text-xs text-gray-500 truncate">{product.seller}</span>
        </div>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-gray-400">{product.postedDate}</span>
        </div>
      </div>
    </div>
  );
}
