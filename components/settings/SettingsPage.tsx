import React, { useEffect } from 'react';
import { ArrowLeft, User, Mail, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';

const SettingsPage: React.FC = () => {
  // 使用选择器，只订阅需要的状态
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const initialized = useUserStore((state) => state.initialized);
  const loading = useUserStore((state) => state.loading);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Loader2 size={48} className="text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-cream py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all btn-bounce"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">账号管理</h1>
            <p className="text-sm text-gray-500">管理您的账号信息</p>
          </div>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-accent flex items-center justify-center text-white">
                  <User size={32} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.email}</h2>
              <p className="text-sm text-gray-500">OgCloud 员工账号</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail size={20} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                  邮箱
                </p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <User size={20} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                  用户 ID
                </p>
                <p className="font-medium font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作区域 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">账号操作</h3>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
          >
            <LogOut size={20} />
            退出登录
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>如需删除账号或修改个人信息，请联系支持团队</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
