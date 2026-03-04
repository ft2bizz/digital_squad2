export type AssetType = 'video' | 'image' | 'audio' | 'avatar' | 'script';

export interface SavedAsset {
  id: string;
  type: AssetType;
  title: string;
  url: string;
  prompt?: string;
  createdAt: number;
  metadata?: any;
}

export const assetStorage = {
  save: async (asset: Omit<SavedAsset, 'id' | 'createdAt'>): Promise<SavedAsset> => {
    const newAsset = {
      ...asset,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: Date.now(),
    };
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset)
    });
    return newAsset;
  },

  getAll: async (): Promise<SavedAsset[]> => {
    const res = await fetch('/api/assets');
    if (!res.ok) return [];
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`/api/assets/${id}`, { method: 'DELETE' });
  },

  getByType: async (type: AssetType): Promise<SavedAsset[]> => {
    const assets = await assetStorage.getAll();
    return assets.filter(a => a.type === type);
  }
};
