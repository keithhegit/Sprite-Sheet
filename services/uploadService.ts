import { authService } from './authService';

const API_BASE = ''; // 使用相对路径，适配本地代理和生产环境

class UploadService {
  /**
   * 上传原始图片
   */
  async uploadOriginal(base64Image: string): Promise<string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/upload/original`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload original image');
      }

      const data = await response.json();
      return data.key;
    } catch (error) {
      console.error('Failed to upload original:', error);
      throw error;
    }
  }

  /**
   * 上传精灵图
   */
  async uploadSprite(
    base64Image: string,
    actionId: string,
    historyId?: string
  ): Promise<string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/upload/sprite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: base64Image,
          actionId,
          historyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload sprite');
      }

      const data = await response.json();
      return data.key;
    } catch (error) {
      console.error('Failed to upload sprite:', error);
      throw error;
    }
  }

  /**
   * 批量上传精灵图
   */
  async uploadSpritesBatch(
    historyId: string,
    sprites: Array<{ image: string; actionId: string }>
  ): Promise<Array<{ actionId: string; key: string }>> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/upload/sprites/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ historyId, sprites }),
      });

      if (!response.ok) {
        throw new Error('Failed to batch upload sprites');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Failed to batch upload sprites:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();


