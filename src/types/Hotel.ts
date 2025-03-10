
export interface Hotel {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  description: string;
  rating: number;
  price: number;
  amenities: string[];
  images: string[];
  coordinates: [number, number]; // [latitude, longitude]
}
