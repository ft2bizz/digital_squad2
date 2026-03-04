import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { generateVideoScript } from '../services/geminiService';

interface IdeationProps {
  onScriptGenerated: (script: string) => void;
}

export function Ideation({ onScriptGenerated }: IdeationProps) {
  const [idea, setIdea] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; url: string; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const [prefix, base64] = result.split(',');
        const mimeType = prefix.split(':')[1].split(';')[0];
        
        setImages(prev => [...prev, {
          data: base64,
          mimeType,
          url: result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (!idea.trim() && images.length === 0) {
      setError('Por favor, insira uma ideia ou faça upload de ativos da marca.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const script = await generateVideoScript(idea, images.map(img => ({ data: img.data, mimeType: img.mimeType })));
      setGeneratedScript(script);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro durante a geração do roteiro.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Inputs */}
      <div className="space-y-6">
        <div className="bg-bg-card border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-medium mb-4">Ativos da Marca & Produtos</h2>
          <p className="text-sm text-gray-400 mb-4">Faça upload de imagens de seus produtos, logotipos ou diretrizes de marca para dar contexto à IA.</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 font-medium transition-all cursor-pointer"
          >
            <Upload size={28} className="mb-3" />
            <span className="text-sm font-medium">Clique para fazer upload de arquivos</span>
            <span className="text-xs text-gray-500 mt-1">PNG, JPG de até 5MB</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            multiple
            className="hidden" 
          />

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a]">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/90 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-bg-card border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-medium mb-4">Sua Ideia</h2>
          <p className="text-sm text-gray-400 mb-4">Descreva o vídeo que você deseja criar. Qual é a vibe? O que acontece?</p>
          
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Um comercial de tênis futurista ambientado em uma cidade cyberpunk iluminada por neon. A câmera gira em torno do sapato enquanto ele flutua..."
            className="w-full h-40 bg-bg-dark border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={isGenerating || (!idea.trim() && images.length === 0)}
          className="w-full bg-primary-gradient hover:opacity-90 disabled:opacity-50 text-white font-medium py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Processar Ideia
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
      <div className="flex flex-col">
        <div className="bg-bg-card border border-white/10 rounded-2xl flex-1 p-6 flex flex-col">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Roteiro de Vídeo Gerado
          </h2>
          
          {generatedScript ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-bg-dark border border-white/5 rounded-xl p-5 text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar">
                {generatedScript}
              </div>
              <button 
                onClick={() => onScriptGenerated(generatedScript)}
                className="mt-6 w-full bg-white text-black hover:bg-gray-100 font-medium py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Usar este roteiro no Gerador
                <ArrowRight size={18} />
              </button>
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-medium mb-2">Analisando sua marca e ideia</h3>
              <p className="text-gray-400 max-w-sm">
                Nosso diretor de IA está criando o prompt visual perfeito para o seu vídeo...
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">Aguardando inspiração</h3>
              <p className="text-sm max-w-xs">
                Faça upload de seus ativos e descreva sua ideia para obter um roteiro de vídeo profissional.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
