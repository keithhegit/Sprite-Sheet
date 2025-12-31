import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Calendar, Image, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { historyService, HistoryRecord } from '../../services/historyService';
import { useUserStore } from '../../stores/userStore';

const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // 使用选择器，只订阅需要的状态
  const user = useUserStore((state) => state.user);
  const initialized = useUserStore((state) => state.initialized);
  const userLoading = useUserStore((state) => state.loading);

  useEffect(() => {
    // 等待用户状态初始化完成再判断是否跳转
    if (!initialized) return;
    
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  // 用户状态还在加载中，显示加载界面
  if (!initialized || userLoading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="text-brand-accent animate-spin mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getHistory();
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError(err.message || '加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？所有相关图片也会被删除。')) return;
    
    try {
      await historyService.deleteHistory(id);
      setRecords(records.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(`删除失败：${err.message}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-brand-cream py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all btn-bounce"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
            <p className="text-sm text-gray-500">查看您之前生成的所有精灵图</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-center">
            {error}
            <button
              onClick={loadHistory}
              className="ml-4 underline hover:no-underline"
            >
              重试
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl">
            <Loader2 size={48} className="text-brand-accent animate-spin mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <Image size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">暂无历史记录</p>
            <p className="text-sm text-gray-400 mb-6">生成精灵图后，它们会自动保存在这里</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-brand-accent text-white rounded-xl font-bold hover:bg-brand-accent/90 transition-all btn-bounce"
            >
              开始生成
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex gap-6 flex-wrap lg:flex-nowrap">
                  {/* 原图 */}
                  <div className="shrink-0">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                      原图
                    </p>
                    <img
                      src={historyService.getImageUrl(record.originalImageKey)}
                      alt="原始图片"
                      className="w-24 h-24 object-contain bg-gray-50 rounded-xl border border-gray-100"
                    />
                  </div>

                  {/* 精灵图列表 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                      生成结果 ({record.sprites.length} 个动作)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {record.sprites.map((sprite) => (
                        <div key={sprite.actionId} className="text-center">
                          <img
                            src={historyService.getImageUrl(sprite.spriteImageKey)}
                            alt={sprite.actionLabel}
                            className="w-20 h-20 object-contain bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-accent transition-colors cursor-pointer"
                            title={sprite.actionLabel}
                          />
                          <p className="text-xs text-gray-600 mt-1 font-medium">
                            {sprite.actionLabel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 操作 */}
                  <div className="shrink-0 flex flex-col items-end justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      {formatDate(record.createdAt)}
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除记录"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;


