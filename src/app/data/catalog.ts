import type { Category } from './types';

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1709949908244-6ebd4fc55b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsJTIwdmlldyUyMFZpZXRuYW18ZW58MXx8fHwxNzc0NDMzOTE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  vegetables: 'https://images.unsplash.com/photo-1633380110125-f6e685676160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBhZ3JpY3VsdHVyZSUyMG1hcmtldHxlbnwxfHx8fDE3NzQ0MzM5MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  appliances: 'https://images.unsplash.com/photo-1740803292814-13d2e35924c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwYXBwbGlhbmNlcyUyMGtpdGNoZW4lMjBlbGVjdHJvbmljc3xlbnwxfHx8fDE3NzQ0MjY4Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  cosmetics: 'https://images.unsplash.com/photo-1600417098578-1e858e93dc88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNvc21ldGljcyUyMGJlYXV0eSUyMHByb2R1Y3RzfGVufDF8fHx8MTc3NDQzMzkxNnww&ixlib=rb-4.1.0&q=80&w=1080',
  bento: 'https://images.unsplash.com/photo-1759299615828-da309e3ff6fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZW50byUyMGJveCUyMGx1bmNoJTIwbWVhbCUyMHByZXBhcmF0aW9ufGVufDF8fHx8MTc3NDQzMzkxOXww&ixlib=rb-4.1.0&q=80&w=1080',
  rice: 'https://images.unsplash.com/photo-1762083295851-a2dc442c7f80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwcmljZSUyMGdyYWluJTIwYWdyaWN1bHR1cmUlMjBmYXJtfGVufDF8fHx8MTc3NDQzMzkyMHww&ixlib=rb-4.1.0&q=80&w=1080',
  faceCream: 'https://images.unsplash.com/photo-1550572017-4b7a301b9d81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBtb2lzdHVyaXplciUyMHNlcnVtJTIwYm90dGxlfGVufDF8fHx8MTc3NDQzMzkyMHww&ixlib=rb-4.1.0&q=80&w=1080',
  fan: 'https://images.unsplash.com/photo-1642260460129-bef801920b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pJTIwZmFuJTIwZGVzayUyMHBvcnRhYmxlJTIwZWxlY3RyaWN8ZW58MXx8fHwxNzc0NDMzOTIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  toteBag: 'https://images.unsplash.com/photo-1654112260750-62e27953e9fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3RlJTIwYmFnJTIwY2FudmFzJTIwc3R1ZGVudCUyMGFjY2Vzc29yaWVzfGVufDF8fHx8MTc3NDQzMzkyMXww&ixlib=rb-4.1.0&q=80&w=1080',
  hoodie: 'https://images.unsplash.com/photo-1634225222400-c1d62052ce11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwaG9vZGllJTIwc3dlYXRzaGlydCUyMGZvbGRlZHxlbnwxfHx8fDE3NzQ0MzM5MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  fruits: 'https://images.unsplash.com/photo-1760705186373-f0fccf98b88c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZydWl0JTIwbWFuZ28lMjBkcmFnb24lMjBmcnVpdHxlbnwxfHx8fDE3NzQ0MzM5MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  kettle: 'https://images.unsplash.com/photo-1587494844659-686415221d68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxobGVjdHJpYyUyMGtldHRsZSUyMHdhdGVyJTIwYm9pbGVyJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NzQ0MzM5MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  lipGloss: 'https://images.unsplash.com/photo-1586495487593-1e01d9890cd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXAlMjBnbG9zcyUyMGxpcHN0aWNrJTIwbWFrZXVwJTIwY29zbWV0aWN8ZW58MXx8fHwxNzc0NDMzOTI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
};

export const categories: Category[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: 'Sprout',
    description: 'Fresh produce & farm goods',
    color: '#2d7a4f',
    bgColor: '#f0fdf4',
    image: IMAGES.vegetables,
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'ChefHat',
    description: 'Homemade & ready-to-eat meals',
    color: '#c05621',
    bgColor: '#fff7ed',
    image: IMAGES.bento,
  },
  {
    id: 'home-appliances',
    name: 'Home Appliances',
    icon: 'Plug',
    description: 'Electronics & household items',
    color: '#1d4ed8',
    bgColor: '#eff6ff',
    image: IMAGES.appliances,
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics',
    icon: 'Sparkles',
    description: 'Beauty & personal care',
    color: '#9d174d',
    bgColor: '#fdf2f8',
    image: IMAGES.cosmetics,
  },
  {
    id: 'university-merch',
    name: 'University Merch',
    icon: 'GraduationCap',
    description: 'Official UEH branded items',
    color: '#1B3A6B',
    bgColor: '#eff6ff',
    image: IMAGES.hoodie,
  },
];

