import { GoogleGenAI, Modality } from '@google/genai';

const getApiKey = () => {
  if (typeof window !== 'undefined' && (window as any).ENV?.API_KEY) {
    return (window as any).ENV.API_KEY;
  }
  return (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
};

const getAi = () => new GoogleGenAI({ apiKey: getApiKey() });

async function uploadToBackend(base64Data: string, extension: string): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: base64Data, extension })
  });
  if (!res.ok) {
    throw new Error('Failed to upload file to server');
  }
  const data = await res.json();
  return data.url;
}

export async function generateVideoScript(
  idea: string,
  images: { data: string; mimeType: string }[]
) {
  const ai = getAi();
  const parts: any[] = [{ text: `You are an expert video director and scriptwriter. Based on the following idea and any provided brand/product images, generate a highly detailed, descriptive prompt for an AI video generation model (like Veo). The prompt should describe the visual scene, camera movement, lighting, and atmosphere in a single, cohesive paragraph. Do not include any text, dialogue, or audio instructions, as this is for a purely visual video generator. Idea: ${idea}` }];
  
  for (const img of images || []) {
    parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
  });
  return response.text || '';
}

export async function generateImage(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' = '1:1') {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio, imageSize: "1K" } },
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) {
    return await uploadToBackend(part.inlineData.data, 'png');
  } else {
    throw new Error('No image generated');
  }
}

export async function editImage(prompt: string, image: { data: string; mimeType: string }) {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: image.data, mimeType: image.mimeType } },
        { text: prompt },
      ],
    },
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) {
    return await uploadToBackend(part.inlineData.data, 'png');
  } else {
    throw new Error('No image generated');
  }
}

export async function generateSpeech(text: string, voiceName: string = 'Kore') {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return await uploadToBackend(base64Audio, 'wav');
  } else {
    throw new Error('No audio generated');
  }
}

export async function generateVideo(
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p',
  image?: { data: string; mimeType: string },
  onProgress?: (status: string) => void
) {
  onProgress?.('Iniciando geração...');
  const ai = getAi();
  const request: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution, aspectRatio },
  };
  if (image) {
    request.image = { imageBytes: image.data, mimeType: image.mimeType };
  }
  let operation = await ai.models.generateVideos(request);

  while (!operation.done) {
    onProgress?.('Gerando vídeo... Isso pode levar alguns minutos.');
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed');
  }

  const fetchRes = await fetch(downloadLink, {
    headers: { 'x-goog-api-key': getApiKey() }
  });
  const blob = await fetchRes.blob();
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return await uploadToBackend(base64Data, 'mp4');
}
