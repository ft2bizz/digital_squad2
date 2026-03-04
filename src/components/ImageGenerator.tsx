import React, { useState } from 'react';
import { Loader2, Sparkles, Download, Image as ImageIcon, Bookmark } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { assetStorage } from '../services/storageService';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    await assetStorage.save({
      type: 'image',
      title: `Imagem IA - ${new Date().toLocaleTimeString()}`,
      url: imageUrl,
      prompt: prompt,
      metadata: { aspectRatio }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const url = await generateImage(prompt, aspectRatio);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao gerar imagem');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Uma cidade futurista com carros voadores..."
            className="w-full h-32 bg-bg-input border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Proporção</label>
          <select 
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="w-full bg-bg-input border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1:1">1:1 (Quadrado)</option>
            <option value="16:9">16:9 (Paisagem)</option>
            <option value="9:16">9:16 (Retrato)</option>
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
              Gerar Imagem
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
        <div className="bg-bg-card border border-white/10 rounded-2xl flex-1 min-h-[400px] flex flex-col overflow-hidden relative">
          {imageUrl ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 bg-bg-dark flex items-center justify-center relative group min-h-0 p-4">
                <img 
                  src={imageUrl} 
                  alt="Generated" 
                  className="max-w-full max-h-full object-contain rounded-lg"
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
                    href={imageUrl} 
                    download="digital-squad-ai-image.png"
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
              <h3 className="text-xl font-medium mb-2">Pintando sua imagem</h3>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">Nenhuma imagem gerada ainda</h3>
              <p className="text-sm max-w-xs">
                Insira um prompt e clique em gerar para criar uma imagem com IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
