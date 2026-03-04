import React, { useState, useRef } from 'react';
import { Loader2, Sparkles, Download, Wand2, Upload, X } from 'lucide-react';
import { editImage } from '../services/geminiService';

export function ImageEditor() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const [prefix, base64] = result.split(',');
      const mimeType = prefix.split(':')[1].split(';')[0];
      
      setImage({
        data: base64,
        mimeType,
        url: result
      });
      setImageUrl(null); // Reset output when new image is uploaded
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !image) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const url = await editImage(prompt, { data: image.data, mimeType: image.mimeType });
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao editar imagem');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Imagem Original</label>
          {image ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#141414] aspect-square flex items-center justify-center">
              <img src={image.url} alt="Original" className="max-w-full max-h-full object-contain" />
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
              className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer aspect-square"
            >
              <Upload size={24} className="mb-2" />
              <span className="text-sm font-medium">Fazer Upload de Imagem</span>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Instruções de Edição</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Adicione um chapéu vermelho ao cachorro..."
            className="w-full h-24 bg-bg-input border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || !image}
          className="w-full bg-primary-gradient hover:opacity-90 disabled:opacity-50 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Editando...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Aplicar Edições
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
                  alt="Edited" 
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#0a0a0a] shrink-0">
                <div className="text-sm text-gray-400 truncate pr-4">
                  <span className="font-medium text-gray-300">Edição:</span> {prompt}
                </div>
                <a 
                  href={imageUrl} 
                  download="digital-squad-ai-edited.png"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Download size={16} />
                  Baixar
                </a>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-medium mb-2">Aplicando edições</h3>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Wand2 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">Nenhuma edição aplicada ainda</h3>
              <p className="text-sm max-w-xs">
                Faça upload de uma imagem e descreva o que você deseja mudar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
