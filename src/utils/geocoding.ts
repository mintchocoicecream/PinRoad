export interface PlaceSearchResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// 두 좌표 간의 거리 계산 (Haversine Formula - 단위: km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 1. 좌표 -> 도시/국가 정보 가져오기 (Reverse Geocoding)
export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'ko,en' } }
    );
    const data = await res.json();
    const addr = data.address || {};

    const country = addr.country || '알 수 없는 국가';
    const city =
      addr.city || addr.town || addr.village || addr.state || '알 수 없는 도시';

    return {
      country,
      city,
      formattedCity: `${country}, ${city}`,
      fullAddress: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      country: '',
      city: '',
      formattedCity: '위치 정보 없음',
      fullAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  }
};

// 2. 장소 이름으로 검색하기 (기준 좌표 전달 시 가까운 순으로 정렬)
export const searchPlaces = async (
  query: string,
  centerLat?: number,
  centerLng?: number
): Promise<PlaceSearchResult[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=10`,
      { headers: { 'Accept-Language': 'ko,en' } }
    );
    const data: PlaceSearchResult[] = await res.json();

    // 기준 좌표가 있으면 클릭한 위치와의 거리를 계산하여 가까운 순으로 정렬
    if (centerLat !== undefined && centerLng !== undefined) {
      data.sort((a, b) => {
        const distA = calculateDistance(centerLat, centerLng, parseFloat(a.lat), parseFloat(a.lon));
        const distB = calculateDistance(centerLat, centerLng, parseFloat(b.lat), parseFloat(b.lon));
        return distA - distB;
      });
    }

    return data;
  } catch (error) {
    console.error('Place search failed:', error);
    return [];
  }
};