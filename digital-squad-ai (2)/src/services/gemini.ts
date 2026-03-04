import { GoogleGenAI, Type } from "@google/genai";
import { TrainingPath } from "../types";

const getApiKey = () => {
  if (typeof window !== 'undefined' && (window as any).ENV?.API_KEY) {
    return (window as any).ENV.API_KEY;
  }
  return (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
};

const getAi = () => new GoogleGenAI({ apiKey: getApiKey() });

export async function generateProfessionPath(profession: string): Promise<TrainingPath> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise como a Inteligência Artificial pode transformar a profissão de "${profession}". 
    Gere uma trilha de treinamento personalizada com 4 módulos, cada um com 3 lições.
    A resposta deve ser em Português.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                lessons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      duration: { type: Type.STRING }
                    },
                    required: ["title", "description", "duration"]
                  }
                }
              },
              required: ["title", "lessons"]
            }
          }
        },
        required: ["title", "description", "modules"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as TrainingPath;
}

export async function generateLessonContent(pathTitle: string, moduleTitle: string, lessonTitle: string): Promise<string> {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Você é um instrutor de IA. Escreva o conteúdo de uma aula curta e prática para a lição "${lessonTitle}" do módulo "${moduleTitle}" dentro do curso "${pathTitle}".
    O conteúdo deve ser em Português, formatado em Markdown, com introdução, pontos principais e uma pequena tarefa prática.`,
  });

  return response.text || 'Conteúdo não disponível.';
}

export const MASTER_PATHS: Record<string, TrainingPath> = {
  'Básico': {
    title: 'Master em IA: Nível Básico',
    description: 'Fundamentos essenciais para quem está começando sua jornada no mundo da Inteligência Artificial.',
    modules: [
      {
        title: 'Introdução à IA',
        lessons: [
          { title: 'O que é IA?', description: 'História e conceitos fundamentais.', duration: '45 min' },
          { title: 'Tipos de IA', description: 'IA Estreita vs IA Geral.', duration: '30 min' },
          { title: 'IA no Dia a Dia', description: 'Exemplos práticos de uso atual.', duration: '40 min' }
        ]
      },
      {
        title: 'IA Generativa',
        lessons: [
          { title: 'Entendendo LLMs', description: 'Como funcionam modelos como o ChatGPT.', duration: '60 min' },
          { title: 'Prompt Engineering 101', description: 'A arte de falar com a IA.', duration: '50 min' },
          { title: 'Ética na IA', description: 'Desafios e responsabilidades.', duration: '45 min' }
        ]
      }
    ]
  },
  'Intermediário': {
    title: 'Master em IA: Nível Intermediário',
    description: 'Aprofundamento técnico e aplicações práticas de IA em fluxos de trabalho complexos.',
    modules: [
      {
        title: 'Machine Learning Aplicado',
        lessons: [
          { title: 'Algoritmos de Classificação', description: 'Prevendo categorias de dados.', duration: '90 min' },
          { title: 'Regressão e Previsão', description: 'Modelagem de tendências.', duration: '80 min' },
          { title: 'Tratamento de Dados', description: 'Preparando informações para IA.', duration: '70 min' }
        ]
      },
      {
        title: 'Automação com IA',
        lessons: [
          { title: 'Integração via API', description: 'Conectando sistemas à IA.', duration: '120 min' },
          { title: 'Agentes Autônomos', description: 'Criando assistentes inteligentes.', duration: '100 min' },
          { title: 'No-Code AI Tools', description: 'Ferramentas de automação visual.', duration: '90 min' }
        ]
      }
    ]
  },
  'Avançado': {
    title: 'Master em IA: Nível Avançado',
    description: 'Domínio de arquiteturas complexas, fine-tuning e implementação de soluções de IA em larga escala.',
    modules: [
      {
        title: 'Deep Learning e Redes Neurais',
        lessons: [
          { title: 'Arquitetura Transformer', description: 'O coração da IA moderna.', duration: '150 min' },
          { title: 'Fine-tuning de Modelos', description: 'Treinando IA com seus próprios dados.', duration: '180 min' },
          { title: 'Visão Computacional', description: 'Processamento avançado de imagens.', duration: '140 min' }
        ]
      },
      {
        title: 'IA na Nuvem e Escala',
        lessons: [
          { title: 'Deploy de Modelos', description: 'Colocando IA em produção.', duration: '120 min' },
          { title: 'Mlopps', description: 'Ciclo de vida de modelos de ML.', duration: '130 min' },
          { title: 'Segurança em IA', description: 'Protegendo sistemas inteligentes.', duration: '110 min' }
        ]
      }
    ]
  }
};
