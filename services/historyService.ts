import { authService } from './authService';

const API_BASE = ''; // 使用相对路径，适配本地代理和生产环境

export interface HistorySprite {
  actionId: string;
  actionLabel: string;
  spriteImageKey: string;
  promptUsed?: string;
}

export interface HistoryRecord {
  id: string;
  originalImageKey: string;
  createdAt: number;
  sprites: HistorySprite[];
}

class HistoryService {
  /**
   * 获取图片 URL
   */
  getImageUrl(key: string): string {
    return `${API_BASE}/api/image/${key}`;
  }

  /**
   * 获取历史记录列表
   */
  async getHistory(): Promise<HistoryRecord[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  }

  /**
   * 获取单条历史记录详情
   */
  async getHistoryDetail(id: string): Promise<HistoryRecord> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history detail');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch history detail:', error);
      throw error;
    }
  }

  /**
   * 创建历史记录
   */
  async createHistory(data: {
    originalImageKey: string;
    sprites: Array<{
      actionId: string;
      actionLabel: string;
      spriteImageKey: string;
      promptUsed?: string;
    }>;
  }): Promise<{ id: string; createdAt: number }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create history');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create history:', error);
      throw error;
    }
  }

  /**
   * 删除历史记录
   */
  async deleteHistory(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE}/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete history');
      }
    } catch (error) {
      console.error('Failed to delete history:', error);
      throw error;
    }
  }
}

export const historyService = new HistoryService();


