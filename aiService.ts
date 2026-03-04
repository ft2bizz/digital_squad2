import { GoogleGenAI, Type } from "@google/genai";
import { ChallengeInput, ProjectSuggestion, BusinessCase } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateProjectSuggestions(input: ChallengeInput): Promise<ProjectSuggestion[]> {
  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Como um consultor sênior de estratégia de IA, analise o seguinte desafio de negócio e sugira 3 a 4 projetos de IA viáveis.
    
    Área: ${input.area}
    Desafio: ${input.description}
    Objetivos: ${input.objectives}
    Budget Disponível: ${input.budget}
    
    Sugira projetos que variam em complexidade e impacto, respeitando a ordem de grandeza do budget informado.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            shortDescription: { type: Type.STRING },
            estimatedImpact: { type: Type.STRING, enum: ['Baixo', 'Médio', 'Alto', 'Transformador'] },
            complexity: { type: Type.STRING, enum: ['Baixa', 'Média', 'Alta'] },
            estimatedCost: { type: Type.STRING }
          },
          required: ["id", "title", "shortDescription", "estimatedImpact", "complexity", "estimatedCost"]
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
}

export async function generateBusinessCase(input: ChallengeInput, project: ProjectSuggestion): Promise<BusinessCase> {
  const model = genAI.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Gere um Business Case detalhado para o seguinte projeto de IA:
    
    Projeto: ${project.title}
    Contexto do Desafio: ${input.description}
    Área: ${input.area}
    Budget: ${input.budget}
    
    O Business Case deve ser profissional, estruturado e pronto para apresentação executiva.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          executiveSummary: { type: Type.STRING },
          problemStatement: { type: Type.STRING },
          proposedSolution: { type: Type.STRING },
          technicalRequirements: {
            type: Type.OBJECT,
            properties: {
              dataSources: { type: Type.ARRAY, items: { type: Type.STRING } },
              infrastructure: { type: Type.ARRAY, items: { type: Type.STRING } },
              aiModels: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                duration: { type: Type.STRING },
                milestones: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          roiAnalysis: { type: Type.STRING },
          risksAndMitigations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                risk: { type: Type.STRING },
                mitigation: { type: Type.STRING }
              }
            }
          }
        },
        required: [
          "title", "executiveSummary", "problemStatement", "proposedSolution", 
          "technicalRequirements", "timeline", "roiAnalysis", "risksAndMitigations"
        ]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
}
