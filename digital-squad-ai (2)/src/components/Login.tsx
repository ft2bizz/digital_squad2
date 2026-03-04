import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@digitalsquad.ai');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-semibold text-2xl tracking-tight">Digital Squad AI</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-400 mb-8">Faça login para acessar seu estúdio de criação com IA.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-input border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Senha</label>
                <a href="#" className="text-sm text-primary hover:text-primary-hover transition-colors">Esqueceu a senha?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-input border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-gradient hover:opacity-90 disabled:opacity-50 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar na Plataforma
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-8">
            Não tem uma conta? <a href="#" className="text-primary hover:text-primary-hover transition-colors">Solicite acesso</a>
          </p>
        </div>
      </div>

      {/* Right side - Marketing Call */}
      <div className="hidden lg:flex w-1/2 bg-bg-card border-l border-white/5 relative overflow-hidden items-center justify-center p-12">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            <span>Plataforma UGC AI Líder</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-6">
            Escale seu <span className="text-primary-gradient">Conteúdo UGC</span> com Inteligência Artificial.
          </h2>
          
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            A primeira plataforma completa de AI User Content Generator. Crie anúncios autênticos, avatares realistas e vídeos virais em minutos.
          </p>

          <div className="space-y-4">
            {[
              'Geração de vídeos UGC hiper-realistas',
              'Clonagem de formatos virais do TikTok/Reels',
              'Avatares de criadores e locuções nativas',
              'Fluxos completos para anúncios de alta conversão'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-primary" />
                </div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 rounded-2xl glass">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-[#0a0a0a]"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-500 mb-0.5">
                  {'★★★★★'}
                </div>
                <span className="text-gray-400">Junte-se a +10.000 criadores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
