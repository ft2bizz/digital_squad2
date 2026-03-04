import React, { useState, useRef } from 'react';
import { Loader2, Sparkles, Copy, Upload, X, ArrowRight } from 'lucide-react';
import { generateVideoScript, generateVideo } from '../services/geminiService';

export function ViralClone() {
  const [step, setStep] = useState<1 | 2>(1);
  const [image, setImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [script, setScript] = useState('');
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
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Por favor, faça upload de uma captura de tela do vídeo viral.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `Analise esta captura de tela de um vídeo viral. O que o torna envolvente? Descreva o estilo visual, ângulo da câmera, iluminação e o assunto. Em seguida, crie um prompt detalhado para um gerador de vídeo com IA criar um vídeo semelhante e altamente envolvente. ${description ? 'Contexto adicional: ' + description : ''}`;
      
      const generatedScript = await generateVideoScript(prompt, [{ data: image.data, mimeType: image.mimeType }]);
      setScript(generatedScript);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao analisar a imagem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 lg:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                <Copy size={20} />
              </div>
              <div>
                <h2 className="text-xl font-medium">Passo 1: Analisar Conteúdo Viral</h2>
                <p className="text-sm text-gray-400">Faça upload de uma captura de tela de um vídeo viral que você deseja emular.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Captura de Tela Viral</label>
                {image ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] aspect-video flex items-center justify-center">
                    <img src={image.url} alt="Viral" className="max-w-full max-h-full object-contain" />
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
                    <span className="text-sm font-medium">Fazer Upload de Captura de Tela</span>
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

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">O que você deseja mudar? (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mantenha o mesmo movimento dinâmico da câmera, mas mude o assunto para um robô futurista..."
                  className="w-full h-32 bg-bg-dark border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !image}
                  className="w-full bg-primary-gradient hover:opacity-90 disabled:opacity-50 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analisar e Extrair Prompt
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-medium">Passo 2: Gerar Clone</h2>
                  <p className="text-sm text-gray-400">Extraímos a essência do vídeo viral em um prompt.</p>
                </div>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Recomeçar
              </button>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 text-gray-300 leading-relaxed mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Prompt Extraído</h4>
              {script}
            </div>

            <button 
              onClick={() => {
                // In a real app, we'd pass this to the VideoGenerator component
                // For this demo, we'll just alert that it's ready
                alert('Pronto para gerar! Mudando para o Gerador de Vídeo...');
              }}
              className="w-full bg-primary-gradient hover:opacity-90 text-white font-medium py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20"
            >
              Gerar Clone de Vídeo
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
