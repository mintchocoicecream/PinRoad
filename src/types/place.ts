export interface Place {
  id: string;
  user_id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  review?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}