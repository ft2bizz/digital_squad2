import React, { useState } from 'react';
import { Loader2, Sparkles, Megaphone, ArrowRight, Mic } from 'lucide-react';
import { Ideation } from './Ideation';
import { VideoGenerator } from './VideoGenerator';
import { TTSGenerator } from './TTSGenerator';

export function AIAdWorkflow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [script, setScript] = useState('');
  
  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -z-10"></div>
        <div className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
        
        <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'bg-[#0a0a0a] border-primary text-primary' : 'bg-[#141414] border-white/10 text-gray-500'}`}>
            1
          </div>
          <span className="text-xs font-medium uppercase tracking-wider">Ideação</span>
        </div>
        
        <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'bg-[#0a0a0a] border-primary text-primary' : 'bg-[#141414] border-white/10 text-gray-500'}`}>
            2
          </div>
          <span className="text-xs font-medium uppercase tracking-wider">Vídeo</span>
        </div>
        
        <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'bg-[#0a0a0a] border-primary text-primary' : 'bg-[#141414] border-white/10 text-gray-500'}`}>
            3
          </div>
          <span className="text-xs font-medium uppercase tracking-wider">Locução</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 lg:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-medium">Passo 1: Brainstorm do seu Anúncio</h2>
                <p className="text-sm text-gray-400">Faça upload das imagens do seu produto e descreva o conceito do anúncio.</p>
              </div>
            </div>
            
            <Ideation onScriptGenerated={(generatedScript) => {
              setScript(generatedScript);
              setStep(2);
            }} />
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
                  <h2 className="text-xl font-medium">Passo 2: Gerar Vídeo</h2>
                  <p className="text-sm text-gray-400">Nós preenchemos o prompt com o seu roteiro gerado.</p>
                </div>
              </div>
              <button 
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Próximo: Locução
                <ArrowRight size={16} />
              </button>
            </div>
            
            <VideoGenerator initialPrompt={script} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Mic size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-medium">Passo 3: Adicionar Locução</h2>
                  <p className="text-sm text-gray-400">Gere uma locução profissional para o seu anúncio.</p>
                </div>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Iniciar Novo Anúncio
              </button>
            </div>
            
            <TTSGenerator />
          </div>
        )}
      </div>
    </div>
  );
}
