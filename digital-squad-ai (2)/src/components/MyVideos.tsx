import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Video, Image as ImageIcon, Mic, Trash2, ExternalLink, Download, User, FileText } from 'lucide-react';
import { assetStorage, SavedAsset, AssetType } from '../services/storageService';

export function MyVideos() {
  const [assets, setAssets] = useState<SavedAsset[]>([]);
  const [filter, setFilter] = useState<AssetType | 'all'>('all');

  useEffect(() => {
    assetStorage.getAll().then(setAssets);
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      await assetStorage.delete(id);
      setAssets(await assetStorage.getAll());
    }
  };

  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(a => a.type === filter);

  const stats = {
    video: assets.filter(a => a.type === 'video').length,
    image: assets.filter(a => a.type === 'image').length,
    audio: assets.filter(a => a.type === 'audio').length,
    avatar: assets.filter(a => a.type === 'avatar').length,
    script: assets.filter(a => a.type === 'script').length,
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case 'video': return <Video size={20} />;
      case 'image': return <ImageIcon size={20} />;
      case 'audio': return <Mic size={20} />;
      case 'avatar': return <User size={20} />;
      case 'script': return <FileText size={20} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats & Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button 
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${filter === 'all' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-card border-white/5 text-gray-400 hover:border-white/10'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs font-medium">Todos ({assets.length})</span>
        </button>
        <button 
          onClick={() => setFilter('video')}
          className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${filter === 'video' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-card border-white/5 text-gray-400 hover:border-white/10'}`}
        >
          <Video size={24} />
          <span className="text-xs font-medium">Vídeos ({stats.video})</span>
        </button>
        <button 
          onClick={() => setFilter('image')}
          className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${filter === 'image' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-card border-white/5 text-gray-400 hover:border-white/10'}`}
        >
          <ImageIcon size={24} />
          <span className="text-xs font-medium">Imagens ({stats.image})</span>
        </button>
        <button 
          onClick={() => setFilter('audio')}
          className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${filter === 'audio' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-card border-white/5 text-gray-400 hover:border-white/10'}`}
        >
          <Mic size={24} />
          <span className="text-xs font-medium">Áudio ({stats.audio})</span>
        </button>
        <button 
          onClick={() => setFilter('avatar')}
          className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${filter === 'avatar' ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-card border-white/5 text-gray-400 hover:border-white/10'}`}
        >
          <User size={24} />
          <span className="text-xs font-medium">Avatares ({stats.avatar})</span>
        </button>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-bg-card border border-white/10 rounded-2xl min-h-[400px]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
            <LayoutDashboard size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-medium text-gray-300 mb-2">Sua Biblioteca está Vazia</h3>
          <p className="text-gray-400 max-w-md">
            Você ainda não salvou nenhum item nesta categoria. Comece a criar e salve seus favoritos!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
              <div className="aspect-video bg-bg-dark relative flex items-center justify-center overflow-hidden">
                {asset.type === 'video' && (
                  <video src={asset.url} className="w-full h-full object-cover" />
                )}
                {asset.type === 'image' && (
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                )}
                {asset.type === 'avatar' && (
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                )}
                {asset.type === 'audio' && (
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Mic size={32} />
                  </div>
                )}
                {asset.type === 'script' && (
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                  <a 
                    href={asset.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg transition-all"
                    title="Ver"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <a 
                    href={asset.url} 
                    download={`${asset.title}.${asset.type === 'video' ? 'mp4' : asset.type === 'audio' ? 'wav' : 'png'}`}
                    className="p-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg transition-all"
                    title="Baixar"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary">{getIcon(asset.type)}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{asset.type}</span>
                </div>
                <h4 className="font-medium text-gray-200 truncate mb-1">{asset.title}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(asset.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                {asset.prompt && (
                  <p className="text-xs text-gray-400 mt-3 line-clamp-2 italic">
                    "{asset.prompt}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
