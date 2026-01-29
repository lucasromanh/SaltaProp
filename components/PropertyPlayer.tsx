
import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    Play,
    Pause,
    ChevronLeft,
    ChevronRight,
    Maximize,
    Bed,
    Bath,
    Square,
    MapPin,
    Maximize2,
    Home as HomeIcon
} from 'lucide-react';
import { Property } from '../types';

interface PropertyPlayerProps {
    properties: Property[];
    onClose: () => void;
    autoPlayInterval?: number;
}

export const PropertyPlayer: React.FC<PropertyPlayerProps> = ({
    properties,
    onClose,
    autoPlayInterval = 5000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const currentProperty = properties[currentIndex];

    const [showControls, setShowControls] = useState(true);

    const nextSlide = useCallback(() => {
        if (currentImgIndex < currentProperty.images.length - 1) {
            setCurrentImgIndex(prev => prev + 1);
        } else {
            setCurrentImgIndex(0);
            setCurrentIndex(prev => (prev + 1) % properties.length);
        }
        setProgress(0);
    }, [currentImgIndex, currentProperty.images.length, properties.length]);

    const prevSlide = () => {
        if (currentImgIndex > 0) {
            setCurrentImgIndex(prev => prev - 1);
        } else {
            const prevPropIndex = (currentIndex - 1 + properties.length) % properties.length;
            setCurrentIndex(prevPropIndex);
            setCurrentImgIndex(properties[prevPropIndex].images.length - 1);
        }
        setProgress(0);
    };

    // Auto-hide controls
    useEffect(() => {
        let timeout: any;
        const handleActivity = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('touchstart', handleActivity);
        window.addEventListener('keydown', handleActivity);

        handleActivity(); // Initial show

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        nextSlide();
                        return 0;
                    }
                    return prev + 1;
                });
            }, autoPlayInterval / 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, nextSlide, autoPlayInterval]);

    // Manejar teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === ' ') setIsPlaying(!isPlaying);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, nextSlide, isPlaying]);

    return (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500 cursor-none">
            {/* Background Image with Blur */}
            <div className={`absolute inset-0 z-0 ${!showControls ? 'cursor-none' : 'cursor-default'}`}>
                <img
                    src={currentProperty.images[currentImgIndex]}
                    className="w-full h-full object-cover opacity-30 blur-2xl scale-110"
                    alt="background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
            </div>

            {/* Logo Watermark (Always Visible) */}
            <div className="fixed bottom-8 right-8 z-[1001] pointer-events-none">
                <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center transform rotate-12 shadow-lg">
                        <HomeIcon className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">Salta<span className="text-orange-600">Prop</span></h1>
                        <p className="text-[7px] font-black tracking-[0.3em] uppercase text-white/40 mt-0.5">Showcase Mode</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`relative z-10 w-full h-full flex flex-col landscape:flex-row lg:flex-row p-4 md:p-6 lg:p-10 gap-4 md:gap-6 lg:gap-10 items-center justify-center max-w-[1700px] mx-auto overflow-y-auto landscape:overflow-hidden ${!showControls ? 'cursor-none' : 'cursor-default'}`}>

                {/* main Card / Frame */}
                <div className="relative w-full h-[45vh] landscape:h-full lg:h-full flex-1 rounded-[1.5rem] md:rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-3xl border border-white/10 group min-h-[300px] landscape:min-h-0 bg-neutral-900">
                    <img
                        src={currentProperty.images[currentImgIndex]}
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        alt=""
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200';
                        }}
                    />

                    {/* Progress Bar Top */}
                    <div className="absolute top-0 left-0 right-0 h-1 md:h-2 bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-orange-600 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Transaction Type Label */}
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 bg-orange-600 px-4 md:px-7 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-sm font-black uppercase tracking-[0.2em] shadow-xl">
                        {currentProperty.transaction}
                    </div>

                    {/* Image Navigation Info */}
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-black/60 backdrop-blur-xl px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-xs font-black uppercase text-white/70 border border-white/10">
                        FOTO {currentImgIndex + 1} / {currentProperty.images.length}
                    </div>
                </div>

                {/* Info Box */}
                <div className="w-full landscape:flex-1 lg:flex-none lg:w-[480px] xl:w-[650px] flex flex-col gap-4 md:gap-6 animate-in slide-in-from-right duration-700 max-h-full">
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 md:p-8 lg:p-10 rounded-[1.5rem] md:rounded-[2.5rem] lg:rounded-[3.5rem] shadow-3xl relative flex-1 flex flex-col justify-center overflow-hidden">

                        <div className="showcase-content-wrapper w-full">
                            <h4 className="text-orange-500 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-2 md:mb-5">Propiedad en Showcase</h4>
                            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-5xl font-black italic uppercase tracking-tighter text-white leading-[1.1] mb-4 md:mb-6 lg:mb-8">{currentProperty.title}</h2>

                            <p className="flex items-center gap-2 text-gray-400 text-[10px] md:text-xs lg:text-sm xl:text-lg font-bold uppercase tracking-widest mb-4 md:mb-8 lg:mb-10 xl:mb-12">
                                <MapPin size={18} className="text-orange-500" />
                                {currentProperty.neighborhood}, {currentProperty.city}
                            </p>

                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-10 lg:mb-12">
                                <div className="p-3 md:p-4 lg:p-5 bg-white/[0.05] rounded-2xl md:rounded-[1.5rem] border border-white/5 flex flex-col">
                                    <p className="text-[7px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 lg:mb-1.5 text-xs">Precio</p>
                                    <p className="text-base md:text-lg lg:text-lg xl:text-3xl font-black text-white italic whitespace-nowrap overflow-hidden text-ellipsis">{currentProperty.currency} {currentProperty.price.toLocaleString()}</p>
                                </div>
                                <div className="p-3 md:p-4 lg:p-5 bg-white/[0.05] rounded-2xl md:rounded-[1.5rem] border border-white/5 flex flex-col overflow-hidden text-ellipsis">
                                    <p className="text-[7px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 lg:mb-1.5 text-xs">Tipo</p>
                                    <p className="text-base md:text-lg lg:text-lg xl:text-3xl font-black text-white italic truncate">{currentProperty.type}</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-white/5 pt-4 md:pt-6 lg:pt-8 flex flex-row items-center justify-between gap-4">
                                <div className="flex gap-4 md:gap-8 lg:gap-10">
                                    <div className="flex flex-col items-center gap-1 md:gap-3">
                                        <Maximize2 size={16} className="text-orange-500 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                                        <span className="text-[9px] md:text-xs lg:text-sm xl:text-base font-black text-white">{currentProperty.area}m²</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 md:gap-3">
                                        <Bed size={16} className="text-orange-500 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                                        <span className="text-[9px] md:text-xs lg:text-sm xl:text-base font-black text-white">{currentProperty.bedrooms || '-'} D.</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 md:gap-3">
                                        <Bath size={16} className="text-orange-500 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
                                        <span className="text-[9px] md:text-xs lg:text-sm xl:text-base font-black text-white">{currentProperty.bathrooms || '-'} B.</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-gray-500 mb-0.5 md:mb-1">PROPIEDAD</p>
                                    <p className="text-[10px] md:text-sm lg:text-base xl:text-xl font-black text-white/40">{currentIndex + 1} / {properties.length}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className={`lg:hidden absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Player controls (Always Visible) */}
                    <div className="flex items-center justify-center gap-3 md:gap-6 bg-black/40 backdrop-blur-3xl border border-white/10 p-2 md:p-4 lg:p-5 rounded-full shadow-2xl mx-auto w-fit">
                        <button
                            onClick={prevSlide}
                            className="w-10 h-10 md:w-14 md:h-14 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
                        >
                            <ChevronLeft size={20} md:size={28} lg:size={24} />
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 md:w-18 md:h-18 lg:w-14 lg:h-14 flex items-center justify-center rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-xl shadow-orange-600/20 active:scale-90"
                        >
                            {isPlaying ? <Pause size={24} md:size={32} lg:size={24} /> : <Play size={24} md:size={32} lg:size={24} fill="currentColor" />}
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-10 h-10 md:w-14 md:h-14 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
                        >
                            <ChevronRight size={20} md:size={28} lg:size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Close Button Top Right (Desktop Only) - Auto Hides */}
            <button
                onClick={onClose}
                className={`hidden lg:flex fixed top-8 right-8 z-[1001] w-14 h-14 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white hover:bg-orange-600 transition-all active:scale-95 shadow-2xl ${showControls ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-4 pointer-events-none'}`}
            >
                <X size={28} />
            </button>



            <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-right { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-in { animation-duration: 0.5s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-in-right; }
        
        @media (max-height: 600px) and (orientation: landscape) {
          .showcase-content-wrapper h2 { font-size: 1.1rem !important; margin-bottom: 0.3rem !important; }
          .showcase-content-wrapper h4 { font-size: 0.5rem !important; margin-bottom: 0.1rem !important; }
          .showcase-content-wrapper p { margin-bottom: 0.3rem !important; margin-top: 0 !important; font-size: 0.7rem !important; }
          .showcase-content-wrapper .grid { margin-bottom: 0.3rem !important; gap: 0.4rem !important; }
          .showcase-content-wrapper .grid > div { padding: 0.4rem !important; }
          .showcase-content-wrapper .border-t { padding-top: 0.3rem !important; margin-top: 0.3rem !important; }
        }
      `}</style>
        </div>
    );
};
