
import React, { useState } from 'react';
import { Play, Maximize2, RotateCw, Video } from 'lucide-react';

export const PanoramicViewer = ({ imageUrl }: { imageUrl: string }) => {
  const [isRotating, setIsRotating] = useState(true);

  return (
    <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden group">
      <div 
        className={`absolute inset-0 w-[200%] h-full bg-cover bg-center transition-transform duration-[60000ms] ease-linear ${isRotating ? 'animate-panorama' : ''}`}
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-2xl font-bold flex items-center gap-2">
              <RotateCw className="animate-spin-slow" /> Vista 360° Inmersiva
            </h4>
            <p className="text-gray-400">Explora cada rincón de tu próximo hogar</p>
          </div>
          <button 
            onClick={() => setIsRotating(!isRotating)}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-4 rounded-full transition-all"
          >
            {isRotating ? 'Pausar Tour' : 'Reanudar Tour'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes panorama {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-panorama {
          animation: panorama 60s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export const VideoTour = ({ videoUrl }: { videoUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black group">
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button 
            onClick={() => setIsPlaying(true)}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-2xl group-hover:bg-emerald-400"
          >
            <Play fill="currentColor" size={40} />
          </button>
        </div>
      ) : (
        <video 
          src={videoUrl} 
          controls 
          autoPlay 
          className="w-full h-full object-cover"
        />
      )}
      
      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <Video size={16} className="text-red-500" />
        <span className="text-sm font-bold tracking-widest uppercase">Property Video Tour</span>
      </div>

      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />
    </div>
  );
};
