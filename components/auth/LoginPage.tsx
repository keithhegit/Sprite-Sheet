import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { authService } from '../../services/authService';

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const validateOgcloudEmail = (value: string) => value.trim().toLowerCase().endsWith('@ogcloud.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!validateOgcloudEmail(email)) {
        throw new Error('仅允许使用 @ogcloud.com 公司邮箱');
      }

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      if (trimmedPassword.length < 6) {
        throw new Error('密码至少需要 6 位字符');
      }

      const user = isRegistering
        ? await authService.register(trimmedEmail, trimmedPassword)
        : await authService.login(trimmedEmail, trimmedPassword);

      setUser(user);
      setSuccess(isRegistering ? '注册成功，已自动登录' : '登录成功');

      navigate('/');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-accent p-8 text-center relative">
          <button
            onClick={() => navigate('/')}
            className="absolute left-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-white mb-2">
            {isRegistering ? '注册 OgSprite' : '登录 OgSprite'}
          </h1>
          <p className="text-white/80 text-sm">仅支持 @ogcloud.com 公司邮箱</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-green-100">
              <CheckCircle2 size={16} className="shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">公司邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ogcloud.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位字符"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  处理中...
                </>
              ) : (
                isRegistering ? '注册账号' : '立即登录'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-gray-500 hover:text-brand-accent font-medium transition-colors"
            >
              {isRegistering ? '已有账号？去登录' : '没有账号？注册一个'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
