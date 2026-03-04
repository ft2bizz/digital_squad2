import React, { useState } from 'react';
import { Loader2, Sparkles, Download, User, Bookmark } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { assetStorage } from '../services/storageService';

export function AvatarGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    await assetStorage.save({
      type: 'avatar',
      title: `Avatar IA - ${new Date().toLocaleTimeString()}`,
      url: imageUrl,
      prompt: prompt,
      metadata: { style }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const fullPrompt = `Um retrato de avatar profissional de alta qualidade de uma pessoa. Estilo: ${style}. Descrição: ${prompt}. Centralizado, boa iluminação, fundo sólido ou desfocado.`;
      const url = await generateImage(fullPrompt, '1:1');
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao gerar avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Descrição do Avatar</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Uma jovem com cabelo azul curto, usando uma jaqueta cyberpunk..."
            className="w-full h-32 bg-bg-input border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Estilo</label>
          <select 
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="photorealistic">Fotorrealista</option>
            <option value="3d-render">Renderização 3D / Estilo Pixar</option>
            <option value="anime">Anime / Mangá</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="oil-painting">Pintura a Óleo</option>
            <option value="corporate">Foto Corporativa</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
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
              Gerar Avatar
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col">
        <div className="bg-[#141414] border border-white/10 rounded-2xl flex-1 min-h-[400px] flex flex-col overflow-hidden relative">
          {imageUrl ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center relative group min-h-0 p-4">
                <img 
                  src={imageUrl} 
                  alt="Generated Avatar" 
                  className="max-w-full max-h-full object-contain rounded-full border-4 border-white/10 shadow-2xl"
                  style={{ width: '300px', height: '300px' }}
                />
              </div>
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#0a0a0a] shrink-0">
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
                    href={imageUrl} 
                    download="digital-squad-ai-avatar.png"
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
              <h3 className="text-xl font-medium mb-2">Criando seu avatar</h3>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <User size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">Nenhum avatar gerado ainda</h3>
              <p className="text-sm max-w-xs">
                Descreva a pessoa e escolha um estilo para criar um avatar com IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
