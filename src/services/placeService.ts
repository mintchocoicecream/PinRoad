import { supabase } from '../lib/supabase';
import { type NewPlaceData } from '../components/map/AddPlaceModal';
import type { Place } from '../types/place';

export const placeService = {
  /**
   * 1. 사진 파일들을 Supabase Storage에 업로드하고 Public URL 배열을 반환받는 함수
   */
  async uploadImages(userId: string, photos: File[]): Promise<string[]> {
    if (!photos || photos.length === 0) return [];

    const uploadPromises = photos.map(async (file, index) => {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('place-photos')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from('place-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return await Promise.all(uploadPromises);
  },

  /**
   * 2. 장소 데이터와 사진 URL들을 받아 places 테이블에 저장하는 함수
   */
  async createPlace(userId: string, data: NewPlaceData) {
    try {
      let imageUrls: string[] = [];
      if (data.photos && data.photos.length > 0) {
        imageUrls = await this.uploadImages(userId, data.photos);
      }

      const [country, city] = data.cityInfo.split(',').map((s) => s.trim());

      const { data: insertedData, error: insertError } = await supabase
        .from('places')
        .insert([
          {
            user_id: userId,
            name: data.name,
            country: country || '알 수 없는 국가',
            city: city || '알 수 없는 도시',
            address: data.address,
            lat: data.lat,
            lng: data.lng,
            rating: data.rating,
            review: data.review || null,
            image_urls: imageUrls,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(`장소 저장 실패: ${insertError.message}`);
      }

      return { success: true, data: insertedData };
    } catch (error: any) {
      console.error('createPlace Error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. 사용자의 등록된 장소 목록을 가져오는 함수
   */
  async getPlaces(): Promise<Place[]> {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getPlaces Error:', error);
      return [];
    }

    return data || [];
  },

  /**
   * 💡 4. 특정 장소 정보를 수정하는 함수 (updatePlace)
   */
  async updatePlace(placeId: string, updatedFields: Partial<Place>) {
    try {
      const { data, error } = await supabase
        .from('places')
        .update({
          ...updatedFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', placeId)
        .select()
        .single();

      if (error) {
        throw new Error(`장소 수정 실패: ${error.message}`);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('updatePlace Error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 💡 5. 특정 장소를 삭제하는 함수 (deletePlace)
   */
  async deletePlace(placeId: string) {
    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId);

      if (error) {
        throw new Error(`장소 삭제 실패: ${error.message}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('deletePlace Error:', error);
      return { success: false, error: error.message };
    }
  },
};