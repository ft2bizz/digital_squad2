import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Video, Download, Sparkles, Bookmark } from 'lucide-react';
import { generateVideo } from '../services/geminiService';
import { assetStorage } from '../services/storageService';

interface VideoGeneratorProps {
  initialPrompt?: string;
  mode?: 'text' | 'image' | 'both';
}

export function VideoGenerator({ initialPrompt = '', mode = 'both' }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [image, setImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
  const [avatar, setAvatar] = useState('none');
  const [voice, setVoice] = useState('none');
  const [mood, setMood] = useState('professional');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!videoUrl) return;
    await assetStorage.save({
      type: 'video',
      title: `Vídeo UGC - ${new Date().toLocaleTimeString()}`,
      url: videoUrl,
      prompt: prompt,
      metadata: { aspectRatio, resolution, avatar, voice, mood }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // result is a data URL: data:image/png;base64,iVBORw0KGgo...
      const [prefix, base64] = result.split(',');
      const mimeType = prefix.split(':')[1].split(';')[0];
      
      setImage({
        data: base64,
        mimeType,
        url: result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !image) {
      setError('Por favor, insira um prompt ou faça upload de uma imagem');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Iniciando geração...');

    try {
      // Enrich prompt with avatar, voice and mood context
      let enrichedPrompt = prompt;
      
      const avatarDescriptions: Record<string, string> = {
        'executive': 'Apresentando um executivo moderno e profissional em um escritório elegante.',
        'influencer': 'Apresentando um influenciador casual e carismático em um ambiente urbano vibrante.',
        'futuristic': 'Apresentando um avatar futurista com detalhes neon em um cenário sci-fi.',
        'tech': 'Apresentando um especialista em tecnologia em um laboratório moderno com telas flutuantes.'
      };

      const moodDescriptions: Record<string, string> = {
        'professional': 'O vídeo deve ter uma atmosfera profissional, limpa e corporativa.',
        'energetic': 'O vídeo deve ser altamente energético, com cortes rápidos e cores vibrantes.',
        'cinematic': 'O vídeo deve ter um visual cinematográfico, com iluminação dramática e profundidade de campo.',
        'minimalist': 'O vídeo deve ser minimalista, focado no assunto com fundo simples e elegante.'
      };

      const voiceContext = voice !== 'none' ? `O tom da narração sugerido é compatível com a voz ${voice}. ` : '';
      const avatarContext = avatar !== 'none' ? `${avatarDescriptions[avatar]} ` : '';
      const moodContext = `${moodDescriptions[mood]} `;

      enrichedPrompt = `${avatarContext}${moodContext}${voiceContext}${prompt}`;

      const url = await generateVideo(
        enrichedPrompt,
        aspectRatio,
        resolution,
        image ? { data: image.data, mimeType: image.mimeType } : undefined,
        (msg) => setStatus(msg)
      );
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro durante a geração do vídeo.');
      // Handle race condition where API key might be invalid
      if (err.message?.includes('Requested entity was not found')) {
        setError('Erro na Chave de API. Por favor, selecione novamente sua chave de API nas configurações.');
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-1 space-y-6">
        {/* Prompt Input */}
        {mode !== 'image' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Prompt / Roteiro</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva a cena ou cole seu roteiro aqui..."
              className="w-full h-32 bg-bg-input border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Avatar & Voice Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Avatar IA</label>
            <select 
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">Nenhum</option>
              <option value="executive">Executivo Moderno</option>
              <option value="influencer">Influenciador Casual</option>
              <option value="futuristic">Avatar Futurista</option>
              <option value="tech">Especialista Tech</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Voz da Narração</label>
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">Nenhuma</option>
              <option value="Kore">Kore (Feminina, Profissional)</option>
              <option value="Fenrir">Fenrir (Masculina, Grave)</option>
              <option value="Zephyr">Zephyr (Masculina, Enérgica)</option>
              <option value="Puck">Puck (Feminina, Amigável)</option>
            </select>
          </div>
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Estilo / Mood</label>
          <select 
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="professional">Profissional / Corporativo</option>
            <option value="energetic">Enérgico / Dinâmico</option>
            <option value="cinematic">Cinematográfico / Dramático</option>
            <option value="minimalist">Minimalista / Elegante</option>
          </select>
        </div>

        {/* Image Upload */}
        {mode !== 'text' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {mode === 'image' ? 'Imagem Base' : 'Quadro Inicial (Opcional)'}
            </label>
            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-bg-input aspect-video flex items-center justify-center">
                <img src={image.url} alt="Quadro inicial" className="max-w-full max-h-full object-contain" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer aspect-video"
              >
                <Upload size={24} className="mb-2" />
                <span className="text-sm font-medium">Fazer Upload de Imagem</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG de até 5MB</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        )}

        {mode === 'image' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Instruções de Movimento (Opcional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A câmera se aproxima lentamente, a água se move..."
              className="w-full h-24 bg-bg-input border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Proporção</label>
            <select 
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="16:9">16:9 (Paisagem)</option>
              <option value="9:16">9:16 (Retrato)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Resolução</label>
            <select 
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!prompt.trim() && !image)}
          className="w-full bg-primary-gradient hover:opacity-90 disabled:opacity-50 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Gerar Vídeo
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Right Column: Output */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="bg-bg-card border border-white/10 rounded-2xl flex-1 min-h-[400px] flex flex-col overflow-hidden relative">
          {videoUrl ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 bg-black flex items-center justify-center relative group min-h-0">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-bg-dark shrink-0">
                <div className="text-sm text-gray-400 truncate pr-4">
                  <span className="font-medium text-gray-300">Prompt:</span> {prompt}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSaved ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  >
                    <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                    {isSaved ? 'Salvo!' : 'Salvar'}
                  </button>
                  <a 
                    href={videoUrl} 
                    download="digital-squad-ai-video.mp4"
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <Download size={16} />
                    Baixar
                  </a>
                </div>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-medium mb-2">Criando seu vídeo</h3>
              <p className="text-gray-400 max-w-sm">
                {status || 'Este processo geralmente leva alguns minutos. Sinta-se à vontade para pegar um café!'}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Video size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">Nenhum vídeo gerado ainda</h3>
              <p className="text-sm max-w-xs">
                Insira um prompt e clique em gerar para criar seu primeiro vídeo com IA no Digital Squad AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
