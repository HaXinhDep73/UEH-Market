export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  image: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image: string;
  seller: string;
  sellerAvatar: string;
  rating: number;
  reviewCount?: number;
  description: string;
  phone: string;
  zalo: string;
  email: string;
  condition: string;
  postedDate: string;
}

export interface PendingProduct {
  id: string;
  productName: string;
  seller: string;
  category: string;
  price: number;
  submittedDate: string;
  image: string;
}

export interface PendingRating {
  id: string;
  productName: string;
  reviewer: string;
  rating: number;
  comment: string;
  submittedDate: string;
}

