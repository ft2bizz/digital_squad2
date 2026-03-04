import React, { useState } from 'react';
import { Loader2, Sparkles, Download, Music, Bookmark } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { assetStorage } from '../services/storageService';

export function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!audioUrl) return;
    await assetStorage.save({
      type: 'audio',
      title: `Música/Áudio IA - ${new Date().toLocaleTimeString()}`,
      url: audioUrl,
      prompt: prompt
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Since we don't have a native music generation model in the Gemini API yet,
      // we'll use the TTS model to generate a spoken word "jingle" or rhythmic speech
      // as a placeholder to demonstrate the functionality.
      const text = `Aqui está uma peça falada rítmica baseada no seu prompt: ${prompt}. Boom, clap, boom boom clap. Yeah. Vamos lá.`;
      const url = await generateSpeech(text, 'Fenrir');
      setAudioUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao gerar música');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-primary">
            <strong>Nota:</strong> A verdadeira geração de música por IA estará disponível em breve. Por enquanto, esta ferramenta gera áudio rítmico falado usando nossos modelos TTS avançados com base no seu prompt.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Prompt de Música</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Uma batida eletrônica rápida para um vídeo cyberpunk..."
            className="w-full h-32 bg-bg-input border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-primary-gradient hover:opacity-90 disabled:opacity-50 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Compondo...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Gerar Áudio
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
          {audioUrl ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center relative group min-h-0 p-8">
                <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                      <Music size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Faixa de Áudio Gerada</h4>
                      <p className="text-sm text-gray-400">Palavra Falada Rítmica</p>
                    </div>
                  </div>
                  <audio 
                    src={audioUrl} 
                    controls 
                    autoPlay 
                    className="w-full"
                  />
                </div>
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
                    href={audioUrl} 
                    download="digital-squad-ai-music.wav"
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
              <h3 className="text-xl font-medium mb-2">Compondo áudio</h3>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Music size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-1">Nenhum áudio gerado ainda</h3>
              <p className="text-sm max-w-xs">
                Insira um prompt para gerar uma faixa de áudio com IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
