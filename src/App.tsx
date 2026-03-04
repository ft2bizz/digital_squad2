import React, { useState, useEffect } from 'react';
import { VideoGenerator } from './components/VideoGenerator';
import { Ideation } from './components/Ideation';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageEditor } from './components/ImageEditor';
import { VideoEditor } from './components/VideoEditor';
import { AvatarGenerator } from './components/AvatarGenerator';
import { MusicGenerator } from './components/MusicGenerator';
import { TTSGenerator } from './components/TTSGenerator';
import { AIAdWorkflow } from './components/AIAdWorkflow';
import { ViralClone } from './components/ViralClone';
import { MyVideos } from './components/MyVideos';
import { Login } from './components/Login';
import { 
  KeyRound, 
  PlaySquare, 
  LayoutDashboard, 
  Settings, 
  Sparkles,
  ImagePlay,
  FileVideo,
  Image as ImageIcon,
  Wand2,
  Video,
  User,
  Music,
  Mic,
  Megaphone,
  Copy,
  Lightbulb
} from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<
    'generate' | 'ideation' | 'image-to-video' | 'text-to-video' | 'ai-image' | 
    'ai-image-editor' | 'ai-video-editor' | 'ai-avatar' | 'ai-music' | 'text-to-speech' |
    'ai-ad' | 'viral-clone' | 'my-videos'
  >('ideation');
  const [generatedScript, setGeneratedScript] = useState<string>('');

  useEffect(() => {
    const checkKey = async () => {
      // Safety timeout to prevent stuck loading screen
      const timeout = setTimeout(() => {
        if (hasKey === null) {
          console.warn('API key check timed out, falling back to true');
          setHasKey(true);
        }
      }, 2000);

      try {
        if (window.aistudio?.hasSelectedApiKey) {
          const has = await window.aistudio.hasSelectedApiKey();
          setHasKey(has);
        } else {
          // Fallback for local dev or if aistudio is not available
          setHasKey(true);
        }
      } catch (e) {
        console.error('Error checking API key:', e);
        setHasKey(true);
      } finally {
        clearTimeout(timeout);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition
        setHasKey(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (hasKey === null) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-[#141414] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Chave de API Necessária</h1>
          <p className="text-gray-400 mb-8">
            O Digital Squad AI usa modelos avançados de IA para geração de conteúdo UGC de alta qualidade. 
            Você precisa selecionar uma chave de API do Google Cloud com faturamento ativado para continuar.
            <br/><br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Saiba mais sobre faturamento
            </a>
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-primary-gradient hover:opacity-90 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Selecionar Chave de API
          </button>
        </div>
      </div>
    );
  }

  const getHeaderInfo = () => {
    switch (activeView) {
      case 'generate':
      case 'image-to-video':
      case 'text-to-video':
        return { title: 'Criar Vídeo', subtitle: 'Transforme suas ideias em conteúdo UGC autêntico com IA.' };
      case 'ideation':
        return { title: 'Estúdio de Ideação', subtitle: 'Faça upload dos ativos da sua marca e deixe a IA criar o roteiro de vídeo perfeito.' };
      case 'ai-image':
        return { title: 'Gerador de Imagem IA', subtitle: 'Crie imagens impressionantes a partir de descrições em texto.' };
      case 'ai-image-editor':
        return { title: 'Editor de Imagem IA', subtitle: 'Modifique imagens existentes usando linguagem natural.' };
      case 'ai-video-editor':
        return { title: 'Editor de Vídeo IA', subtitle: 'Estenda ou modifique seus vídeos com IA.' };
      case 'ai-avatar':
        return { title: 'Avatar IA', subtitle: 'Gere avatares profissionais em vários estilos.' };
      case 'ai-music':
        return { title: 'Música IA', subtitle: 'Gere faixas de áudio rítmicas.' };
      case 'text-to-speech':
        return { title: 'Texto para Fala', subtitle: 'Converta texto em locuções com som natural.' };
      case 'ai-ad':
        return { title: 'Fluxo de Anúncio IA', subtitle: 'Fluxo de trabalho completo para criar anúncios em vídeo.' };
      case 'viral-clone':
        return { title: 'Clone Viral', subtitle: 'Extraia a essência de um vídeo viral para criar o seu próprio.' };
      case 'my-videos':
        return { title: 'Minha Biblioteca', subtitle: 'Gerencie seu conteúdo gerado.' };
      default:
        return { title: 'Criar Vídeo', subtitle: 'Transforme suas ideias em conteúdo UGC autêntico com IA.' };
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'generate':
        return <VideoGenerator initialPrompt={generatedScript} mode="both" />;
      case 'image-to-video':
        return <VideoGenerator initialPrompt={generatedScript} mode="image" />;
      case 'text-to-video':
        return <VideoGenerator initialPrompt={generatedScript} mode="text" />;
      case 'ideation':
        return <Ideation onScriptGenerated={(script) => {
          setGeneratedScript(script);
          setActiveView('generate');
        }} />;
      case 'ai-image':
        return <ImageGenerator />;
      case 'ai-image-editor':
        return <ImageEditor />;
      case 'ai-video-editor':
        return <VideoEditor />;
      case 'ai-avatar':
        return <AvatarGenerator />;
      case 'ai-music':
        return <MusicGenerator />;
      case 'text-to-speech':
        return <TTSGenerator />;
      case 'ai-ad':
        return <AIAdWorkflow />;
      case 'viral-clone':
        return <ViralClone />;
      case 'my-videos':
        return <MyVideos />;
      default:
        return <VideoGenerator />;
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-bg-card hidden md:flex flex-col h-screen">
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Digital Squad AI</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Features */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Recursos</div>
              <nav className="space-y-1">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ideation'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ideation' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Lightbulb size={18} />
                  <span className="text-sm font-medium">Ideação</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('generate'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'generate' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <PlaySquare size={18} />
                  <span className="text-sm font-medium">Gerar Vídeo</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('image-to-video'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'image-to-video' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <ImagePlay size={18} />
                  <span className="text-sm font-medium">Imagem para Vídeo</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('text-to-video'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'text-to-video' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <FileVideo size={18} />
                  <span className="text-sm font-medium">Texto para Vídeo</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ai-image'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ai-image' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <ImageIcon size={18} />
                  <span className="text-sm font-medium">Imagem IA</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ai-image-editor'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ai-image-editor' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Wand2 size={18} />
                  <span className="text-sm font-medium">Editor de Imagem IA</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ai-video-editor'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ai-video-editor' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Video size={18} />
                  <span className="text-sm font-medium">Editor de Vídeo IA</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ai-avatar'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ai-avatar' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <User size={18} />
                  <span className="text-sm font-medium">Avatar IA</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ai-music'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ai-music' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Music size={18} />
                  <span className="text-sm font-medium">Música IA</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('text-to-speech'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'text-to-speech' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Mic size={18} />
                  <span className="text-sm font-medium">Texto para Fala</span>
                </a>
              </nav>
            </div>

            {/* Workflows */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Fluxos de Trabalho</div>
              <nav className="space-y-1">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('ai-ad'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'ai-ad' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Megaphone size={18} />
                  <span className="text-sm font-medium">Anúncio IA</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('viral-clone'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'viral-clone' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Copy size={18} />
                  <span className="text-sm font-medium">Clone Viral</span>
                </a>
              </nav>
            </div>

            {/* Library */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Biblioteca</div>
              <nav className="space-y-1">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveView('my-videos'); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeView === 'my-videos' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <LayoutDashboard size={18} />
                  <span className="text-sm font-medium">Meus Vídeos</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 shrink-0">
          <button onClick={handleSelectKey} className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Configurações de API</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center px-6 md:hidden shrink-0">
          <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center mr-3">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Digital Squad AI</span>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight mb-2">
                {headerInfo.title}
              </h1>
              <p className="text-gray-400">
                {headerInfo.subtitle}
              </p>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
