
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Home as HomeIcon,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Navigation,
  Globe,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Building,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  TrendingDown,
  Phone,
  MessageCircle,
  AlertCircle,
  Share2,
  FileText,
  EyeOff,
  Calendar,
  User,
  ShieldCheck,
  Maximize,
  Bed,
  Bath,
  Car,
  Star,
  Instagram,
  Linkedin,
  Youtube,
  HardHat,
  Info,
  ChevronUp
} from 'lucide-react';
import { Property, PropertyType, TransactionType, FilterState } from './types';
import { MOCK_PROPERTIES, SALTA_CITIES } from './constants';
import { PanoramicViewer, VideoTour } from './components/PropertyViewers';
import { MortgageCalculator, CurrencyWidget } from './components/FloatingUI';
import { FilterSidebar } from './components/FilterSidebar';
import { getPropertyAdvice } from './services/geminiService';

declare const L: any;

/* --- COMPONENTE MAPA --- */
const LeafletMap: React.FC<{ property: Property }> = ({ property }) => {
  const mapRef = useRef<any>(null);
  const containerId = `map-${property.id}`;

  useEffect(() => {
    if (!L) return;

    const map = L.map(containerId, {
      center: property.coordinates,
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-orange-600/30 rounded-full animate-ping"></div>
          <div class="bg-orange-600 w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-2xl relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ea580c"/></svg>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-orange-600 rotate-45 border-r border-b border-white"></div>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -40]
    });

    const marker = L.marker(property.coordinates, { icon: customIcon }).addTo(map);

    const popupContent = `
      <div style="padding: 16px; min-width: 240px; font-family: 'Plus Jakarta Sans', sans-serif; background: #111; border-radius: 1rem;">
        <div style="margin-bottom: 10px;">
          <h4 style="margin: 0; color: #fff; font-weight: 800; font-size: 14px; line-height: 1.2; letter-spacing: -0.01em;">${property.title}</h4>
          <p style="margin: 2px 0 0 0; color: #ea580c; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">${property.neighborhood}, ${property.city}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 0.6rem;">
          <div style="display: flex; flex-direction: column;">
            <span style="color: #555; font-size: 8px; font-weight: 800; text-transform: uppercase;">Area</span>
            <span style="color: #fff; font-size: 12px; font-weight: 800;">${property.area} m²</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="color: #555; font-size: 8px; font-weight: 800; text-transform: uppercase;">Dorm.</span>
            <span style="color: #fff; font-size: 12px; font-weight: 800;">${property.bedrooms}</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="color: #555; font-size: 8px; font-weight: 800; text-transform: uppercase;">Baños</span>
            <span style="color: #fff; font-size: 12px; font-weight: 800;">${property.bathrooms}</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="color: #555; font-size: 8px; font-weight: 800; text-transform: uppercase;">Coch.</span>
            <span style="color: #fff; font-size: 12px; font-weight: 800;">${property.parking || 0}</span>
          </div>
        </div>

        <div style="display: flex; items-center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
          <span style="color: #ea580c; font-weight: 900; font-size: 18px;">${property.currency} ${property.price.toLocaleString()}</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      minWidth: 240,
      autoPan: true,
      autoPanPadding: [80, 80]
    }).openPopup();

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      map.panTo(property.coordinates);
    }, 300);

    return () => {
      map.remove();
    };
  }, [property, containerId]);

  return <div id={containerId} className="w-full h-full absolute inset-0" />;
};

/* --- COMPONENTE FOOTER GLOBAL --- */
const GlobalFooter = () => (
  <footer className="bg-[#030303] pt-24 pb-12 border-t border-white/5">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
        <FooterLinks title="Venta" links={['Casas en San Lorenzo', 'Deptos en Salta Capital', 'Terrenos en Vaqueros', 'Fincas en Cafayate']} />
        <FooterLinks title="Alquiler" links={['Deptos en Tres Cerritos', 'Casas en Grand Bourg', 'Locales en el Centro', 'Alquiler temporario Cachi']} />
        <FooterLinks title="Búsquedas Populares" links={['Dptos en venta con piscina', 'Casas con quincho', 'Barrios privados exclusivos', 'Oportunidades Cachi']} />
        <FooterLinks title="Inmuebles" links={['Tasaciones Salta', 'Inmobiliarias Salta', 'Guía de barrios', 'Inversiones en Salta']} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-16 border-t border-white/5">
        <div className="max-w-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
              <HomeIcon className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-black tracking-tighter uppercase italic">Salta<span className="text-orange-600">Prop</span></h2>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">La plataforma líder del mercado inmobiliario en Salta Capital. Conectamos sueños con hogares a través de tecnología y transparencia.</p>
        </div>
        <div className="grid grid-cols-3 gap-16">
          <FooterCol title="Portal" items={['Nosotros', 'Prensa', 'Carreras']} />
          <FooterCol title="Servicios" items={['Tasaciones', 'Asesoría', 'Inversión']} />
          <FooterCol title="Social" items={['Instagram', 'LinkedIn', 'YouTube']} />
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">© 2026 SALTAPROP PREMIUM REAL ESTATE. TODOS LOS DERECHOS RESERVADOS.</p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'LISTINGS' | 'DETAIL'>('HOME');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [authModal, setAuthModal] = useState<'LOGIN' | 'PUBLISH' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [activeProjectZone, setActiveProjectZone] = useState('Salta Capital');

  const initialFilters: FilterState = {
    type: '',
    transaction: TransactionType.BUY,
    city: '',
    search: '',
    isPrivateBarrio: false,
    vallesOnly: false,
    surfaceType: 'Techada',
    surfaceMin: '',
    surfaceMax: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    advertiserType: 'Todos',
    age: '',
    pubDate: '',
    selectedAmenities: [],
    multimedia: [],
    address: ''
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter(p => {
      const matchesType = !filters.type || p.type === filters.type;
      const matchesTransaction = p.transaction === filters.transaction;
      const matchesCity = !filters.city || p.city === filters.city;
      const matchesSearch = !filters.search ||
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.city.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesTransaction && matchesCity && matchesSearch;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(start, start + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const handleAiConsult = async () => {
    if (!aiMessage) return;
    setAiResponse('Pensando...');
    const res = await getPropertyAdvice(aiMessage, selectedProperty?.title);
    setAiResponse(res || '');
  };

  const handleSearchClick = () => {
    setSearchSuggestions([]);
    setView('LISTINGS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProperty = (p: Property) => {
    setSelectedProperty(p);
    setView('DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSearchChange = (val: string) => {
    setFilters({ ...filters, search: val });
    if (val.length > 1) {
      const matches = SALTA_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
      setSearchSuggestions(matches);
    } else {
      setSearchSuggestions([]);
    }
  };

  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reusable sections
  const InterestListsSection = () => (
    <section className="py-24 bg-white/[0.01]">
      <div className="container mx-auto px-6">
        <h3 className="text-2xl font-black mb-12 uppercase italic tracking-tighter">Listados que te pueden interesar</h3>
        <div className="space-y-6">
          <ExpandableCategory
            label="Dptos más vistos"
            icon={<TrendingDown className="text-sky-500" />}
            properties={MOCK_PROPERTIES.filter(p => p.type === PropertyType.APARTMENT).slice(0, 2)}
            onPropertyClick={openProperty}
            onSeeMore={() => {
              setFilters({ ...initialFilters, type: PropertyType.APARTMENT });
              setView('LISTINGS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <ExpandableCategory
            label="Nuevos Publicados"
            icon={<Clock className="text-orange-500" />}
            properties={MOCK_PROPERTIES.slice(0, 2)}
            onPropertyClick={openProperty}
            onSeeMore={() => {
              setFilters(initialFilters);
              setView('LISTINGS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <ExpandableCategory
            label="Bajos de Precio"
            icon={<TrendingDown className="text-emerald-500" />}
            properties={MOCK_PROPERTIES.sort((a, b) => a.price - b.price).slice(0, 2)}
            onPropertyClick={openProperty}
            onSeeMore={() => {
              setFilters(initialFilters);
              setView('LISTINGS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <ExpandableCategory
            label="Proyectos en Pozo"
            icon={<Layers className="text-purple-500" />}
            properties={MOCK_PROPERTIES.filter(p => p.transaction === TransactionType.PROJECTS).slice(0, 2)}
            onPropertyClick={openProperty}
            onSeeMore={() => {
              setFilters({ ...initialFilters, transaction: TransactionType.PROJECTS });
              setView('LISTINGS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </section>
  );

  const FeaturedProjectsSection = () => (
    <section className="py-32 bg-[#080808]">
      <div className="container mx-auto px-6">
        <h3 className="text-4xl font-black text-center mb-12 uppercase italic tracking-tighter">Proyectos destacados por zona</h3>
        <div className="flex justify-center gap-4 mb-16 overflow-x-auto no-scrollbar pb-4">
          {['Salta Capital', 'San Lorenzo', 'Vaqueros', 'Cafayate'].map(zone => (
            <button
              key={zone}
              onClick={() => setActiveProjectZone(zone)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeProjectZone === zone ? 'bg-orange-600 border-orange-600 text-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
            >
              {zone}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_PROPERTIES.filter(p => p.transaction === TransactionType.PROJECTS && (p.city === activeProjectZone)).slice(0, 3).map(p => (
            <ProjectCard key={p.id} project={p} onClick={() => openProperty(p)} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <button onClick={() => { setFilters({ ...initialFilters, transaction: TransactionType.PROJECTS, city: activeProjectZone }); setView('LISTINGS'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-10 py-4 border border-emerald-500/50 text-emerald-500 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10">Ver más proyectos</button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen selection:bg-orange-500/30 text-white bg-[#050505] flex flex-col">
      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0d0d0d] w-full max-w-md border border-white/10 p-10 rounded-[2.5rem] relative">
            <button onClick={() => setAuthModal(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            <h3 className="text-3xl font-black mb-2 uppercase italic text-orange-600">{authModal === 'LOGIN' ? 'Ingresar' : 'Publicar'}</h3>
            <div className="space-y-4 mt-8">
              <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-orange-500" />
              <input type="password" placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-orange-500" />
              <button className="w-full bg-orange-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all">Continuar</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled || view !== 'HOME' ? 'bg-black/95 backdrop-blur-3xl py-4 border-b border-white/5 shadow-2xl' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setView('HOME'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0">
              <HomeIcon className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Salta<span className="text-orange-600">Prop</span></h1>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.25em]">
            <button onClick={() => { setFilters({ ...initialFilters, transaction: TransactionType.BUY }); setView('LISTINGS'); }} className="hover:text-orange-500 transition-colors">Compra</button>
            <button onClick={() => { setFilters({ ...initialFilters, transaction: TransactionType.RENT }); setView('LISTINGS'); }} className="hover:text-orange-500 transition-colors">Alquiler</button>
            <button onClick={() => { setFilters({ ...initialFilters, transaction: TransactionType.PROJECTS }); setView('LISTINGS'); }} className="hover:text-orange-500 transition-colors">Proyectos</button>
            <button onClick={() => { setFilters({ ...initialFilters, isPrivateBarrio: true }); setView('LISTINGS'); }} className="hover:text-orange-500 transition-colors">Barrios Privados</button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setAuthModal('PUBLISH')} className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Publicar</button>
            <button onClick={() => setAuthModal('LOGIN')} className="bg-white text-black px-7 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-xl">Ingresar</button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {view === 'HOME' && (
          <div className="animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="relative h-[150vh] flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2400" className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom" alt="Salta Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#050505]" />
              </div>
              <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl">
                <h2 className="text-5xl md:text-8xl font-black mb-16 leading-tight tracking-tighter">Tu próximo hogar <br /><span className="text-orange-600 italic">está en Salta.</span></h2>
                <div className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-3xl">
                  <div className="flex gap-4 mb-6 ml-4">
                    {[TransactionType.BUY, TransactionType.RENT, TransactionType.PROJECTS].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters(prev => ({ ...prev, transaction: t as any }))}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filters.transaction === t ? 'bg-orange-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                    <div className="relative w-full md:w-64">
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-black">Tipo de inmueble</option>
                        {Object.values(PropertyType).map(pt => <option key={pt} value={pt} className="bg-black">{pt}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                    <div className="flex-1 relative flex items-center bg-white/5 rounded-2xl h-[56px] border border-white/10 px-6 focus-within:border-orange-500 transition-all">
                      <Search className="text-gray-500 shrink-0" size={20} />
                      <input
                        type="text"
                        placeholder="Barrio, calle o ciudad de Salta..."
                        className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:text-gray-600 px-4"
                        value={filters.search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                      />
                      {searchSuggestions.length > 0 && (
                        <div className="absolute top-[64px] left-0 right-0 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-[150] shadow-2xl animate-in fade-in slide-in-from-top-2">
                          {searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => { setFilters({ ...filters, search: suggestion }); setSearchSuggestions([]); }}
                              className="w-full text-left px-6 py-4 hover:bg-orange-600/20 text-sm font-bold border-b border-white/5 last:border-0 transition-colors flex items-center gap-3"
                            >
                              <MapPin size={14} className="text-orange-500" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={handleSearchClick} className="bg-orange-600 hover:bg-orange-700 text-white font-black px-12 h-[56px] rounded-2xl transition-all w-full md:w-auto text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20">BUSCAR</button>
                  </div>
                </div>
              </div>
            </section>

            <InterestListsSection />

            <FeaturedProjectsSection />

            {/* Benefits Section */}
            <section className="py-32 border-y border-white/5 bg-black/40">
              <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                  <h3 className="text-5xl font-black mb-4 tracking-tighter italic uppercase">Te acompañamos en cada paso</h3>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">Desde la primera búsqueda hasta la entrega de llaves, SaltaProp es tu socio estratégico.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
                  <BenefitItem title="Búsqueda Inteligente" desc="Filtros diseñados para la realidad de Salta." icon={<Search size={32} />} />
                  <BenefitItem title="Mi Selección" desc="Guarda favoritos y recibe alertas al instante." icon={<Heart size={32} />} />
                  <BenefitItem title="Red de Expertos" desc="Conectamos con las mejores inmobiliarias locales." icon={<Navigation size={32} />} />
                  <BenefitItem title="Sello de Confianza" desc="Años liderando el mercado inmobiliario local." icon={<ShieldCheck size={32} />} />
                </div>
              </div>
            </section>

            {/* Section: Tips para comprar un proyecto */}
            <section className="py-32 bg-[#050505]">
              <div className="container mx-auto px-6">
                <div className="mb-16">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Tips para comprar un proyecto</h3>
                  <p className="text-gray-500 font-medium">Te dejamos unos consejos para que tengas en cuenta a la hora de comprar un inmueble para vivir o como inversión.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TipItem num="1" title="Constructoras y antecedentes" desc="Es importante que investigues los antecedentes de la constructora y consultes sobre los detalles y calidad de las construcciones." />
                  <TipItem num="2" title="Tiempos de entrega" desc="Pregunta cuáles son los tiempos de entrega y en qué etapa de la construcción se encuentra el proyecto." />
                  <TipItem num="3" title="Permisos y habilitaciones" desc="Consulta si la obra cuenta con los permisos correspondientes, planos y si es posible escriturar una vez finalizada." />
                  <TipItem num="4" title="Pagos y compra" desc="Infórmate sobre los modos de financiamiento, las formas de pago y sobre los gastos para comprar y escriturar." />
                </div>
              </div>
            </section>

            {/* Developments CTA Section */}
            <section className="py-32 container mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-center gap-20 bg-white/[0.02] p-12 lg:p-20 rounded-[4rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="flex-1 relative z-10">
                  <h3 className="text-5xl font-black mb-8 leading-tight tracking-tighter italic">¿Conoces nuestros <br />nuevos desarrollos?</h3>
                  <p className="text-gray-400 text-lg mb-12 leading-relaxed">Descubre proyectos exclusivos en etapa de pozo y construcción avanzada con planes de financiación únicos en Salta.</p>
                  <button onClick={() => { setFilters({ ...initialFilters, transaction: TransactionType.PROJECTS }); setView('LISTINGS'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-transparent border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-10 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest shadow-xl shadow-orange-600/10">
                    Ver Proyectos en Salta
                  </button>
                </div>
                <div className="flex-1 flex gap-6 w-full">
                  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800" className="w-1/2 aspect-[4/5] object-cover rounded-[2.5rem] shadow-2xl group-hover:scale-105 transition-all duration-700" alt="Development 1" />
                  <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" className="w-1/2 aspect-[4/5] object-cover rounded-[2.5rem] mt-16 shadow-2xl group-hover:scale-105 transition-all duration-700 delay-100" alt="Development 2" />
                </div>
              </div>
            </section>

            {/* Oportunidades Destacadas (GLASS DARK) */}
            <section className="py-24 bg-white/[0.01]">
              <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-16">
                  <div>
                    <h4 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Selección Premium</h4>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter">Oportunidades Destacadas</h3>
                  </div>
                  <button onClick={() => setView('LISTINGS')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2 transition-all">Ver todo el catálogo <ArrowRight size={14} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {MOCK_PROPERTIES.filter(p => p.featured).slice(0, 4).map(p => (
                    <GridPropertyCard key={p.id} property={p} onClick={() => openProperty(p)} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'LISTINGS' && (
          <div className="pt-32 min-h-screen bg-[#050505] animate-in fade-in duration-500 flex flex-col">
            <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 flex-1">
              <aside className="lg:w-[360px] shrink-0">
                <div className="sticky top-32 max-h-[calc(140vh-160px)] overflow-y-auto no-scrollbar pr-2">
                  <FilterSidebar filters={filters} setFilters={setFilters} onClear={() => setFilters(initialFilters)} />
                </div>
              </aside>
              <main className="flex-1 space-y-12">
                <h3 className="text-xl font-medium text-gray-400">Mostrando <span className="text-white font-black">{filteredProperties.length}</span> resultados en Salta</h3>
                <div className="flex flex-col gap-10">
                  {paginatedProperties.length > 0 ? paginatedProperties.map(prop => (
                    <HorizontalCatalogCard key={prop.id} property={prop} onClick={() => openProperty(prop)} />
                  )) : (
                    <div className="bg-[#0d0d0d] rounded-[2.5rem] p-20 text-center border border-white/5">
                      <AlertCircle className="mx-auto text-gray-600 mb-6" size={48} />
                      <h4 className="text-2xl font-black mb-2 italic">Sin resultados</h4>
                      <p className="text-gray-500 font-medium">No encontramos propiedades con esos filtros. Intenta con otros parámetros.</p>
                    </div>
                  )}
                </div>

                {/* Paginación UI Corregida */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-12 pb-20">
                    <button
                      onClick={() => { if (currentPage > 1) changePage(currentPage - 1); }}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft />
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          className={`w-12 h-12 rounded-2xl font-black transition-all ${currentPage === page ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (currentPage < totalPages) changePage(currentPage + 1); }}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </main>
            </div>

            {/* SECCIONES REUTILIZADAS EN EL CATALOGO GENERAL */}
            <div className="border-t border-white/5 bg-[#030303]">
              <InterestListsSection />
              <FeaturedProjectsSection />
            </div>
          </div>
        )}

        {view === 'DETAIL' && selectedProperty && (
          <PropertyDetailPage property={selectedProperty} onClose={() => setView('LISTINGS')} onOpenOther={openProperty} onAiConsult={handleAiConsult} aiMessage={aiMessage} setAiMessage={setAiMessage} aiResponse={aiResponse} />
        )}
      </main>

      <GlobalFooter />
      <CurrencyWidget />

      <style>{`
        @keyframes slow-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

/* --- AUXILIARY COMPONENTS --- */

const ExpandableCategory = ({ label, icon, properties, onPropertyClick, onSeeMore }: { label: string, icon: React.ReactNode, properties: Property[], onPropertyClick: (p: Property) => void, onSeeMore?: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-white/10">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-8 flex items-center justify-between cursor-pointer group hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h4 className="text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-orange-500 transition-colors">
            {label}
          </h4>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 hidden sm:block">
            {isOpen ? 'Contraer' : 'Ver Detalles'}
          </span>
          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            {properties.map(p => (
              <div
                key={p.id}
                onClick={() => onPropertyClick(p)}
                className="group/card bg-black/40 border border-white/5 rounded-3xl p-5 flex gap-5 cursor-pointer hover:border-orange-500/30 hover:bg-black/60 transition-all shadow-xl"
              >
                <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden relative">
                  <img
                    src={p.images[0]}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                    alt={p.title}
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h5 className="text-lg font-black text-white line-clamp-1 italic uppercase tracking-tighter">{p.title}</h5>
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mt-1">
                      <MapPin size={10} className="inline mr-1 text-orange-500" /> {p.neighborhood}, {p.city}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-black text-orange-500 italic uppercase">
                      {p.currency} {p.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase text-gray-600">
                      <span className="flex items-center gap-1"><Maximize size={12} /> {p.area}m²</span>
                      <span className="flex items-center gap-1"><Bed size={12} /> {p.bedrooms || '-'}D</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSeeMore) onSeeMore();
              }}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2 hover:translate-x-2 transition-transform"
            >
              Ver Catálogo Completo <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-center text-orange-600 mb-8 shadow-xl transition-transform hover:scale-110">{icon}</div>
    <h4 className="text-lg font-black mb-3 italic uppercase">{title}</h4>
    <p className="text-sm text-gray-500 font-medium px-2 leading-relaxed">{desc}</p>
  </div>
);

const TipItem = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex gap-6 hover:border-orange-600/30 transition-all group">
    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">{num}</div>
    <div>
      <h4 className="text-lg font-black mb-2 text-white italic uppercase">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const ProjectCard: React.FC<{ project: Property, onClick: () => void }> = ({ project, onClick }) => (
  <div onClick={onClick} className="group cursor-pointer bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-emerald-500/50 hover:-translate-y-2 shadow-2xl">
    <div className="relative aspect-video overflow-hidden">
      <img src={project.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={project.title} />
      <div className="absolute top-5 left-5 bg-orange-600/80 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">En Pozo</div>
    </div>
    <div className="p-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-black italic mb-1 uppercase tracking-tighter text-white">{project.title}</h4>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{project.neighborhood}, {project.city}</p>
        </div>
        <div className="bg-white/5 p-2 rounded-xl text-emerald-500"><Building size={20} /></div>
      </div>
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
        <span className="text-sm font-black text-white uppercase italic">Desde <span className="text-emerald-500 text-lg">USD {project.price.toLocaleString()}</span></span>
        <ArrowRight size={18} className="text-gray-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  </div>
);

const CategoryLink = ({ label, icon, onClick }: { label: string, icon: React.ReactNode, onClick?: () => void }) => (
  <div onClick={onClick} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-orange-500/30 transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </div>
    <ArrowRight size={14} className="text-gray-700 group-hover:text-orange-500 transition-all" />
  </div>
);

const FooterLinks = ({ title, links }: { title: string, links: string[] }) => (
  <div>
    <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8">{title}</h6>
    <ul className="space-y-4">
      {links.map(l => <li key={l}><a href="#" className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors">{l}</a></li>)}
    </ul>
  </div>
);

const FooterCol = ({ title, items }: { title: string, items: string[] }) => (
  <div className="min-w-[120px]">
    <h6 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">{title}</h6>
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item}><a href="#" className="text-[11px] font-bold text-gray-600 hover:text-white transition-colors">{item}</a></li>
      ))}
    </ul>
  </div>
);

const GridPropertyCard: React.FC<{ property: Property, onClick: () => void }> = ({ property, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-3xl shadow-2xl"
  >
    <div className="relative aspect-[4/5] overflow-hidden">
      <img
        src={property.images[0]}
        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
        alt={property.title}
        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"; }}
      />
      <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{property.transaction}</div>
    </div>
    <div className="p-8 text-white">
      <h4 className="text-2xl font-black mb-1 text-white italic uppercase tracking-tighter">{property.currency} {property.price.toLocaleString()}</h4>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 truncate">{property.neighborhood}, {property.city}</p>
      <div className="flex gap-4 text-[9px] font-black uppercase text-gray-400 border-t border-white/5 pt-5">
        <span className="flex items-center gap-1"><Maximize size={12} className="text-orange-500" /> {property.area} m²</span>
        <span className="flex items-center gap-1"><Bed size={12} className="text-orange-500" /> {property.bedrooms || '-'} Dorm.</span>
      </div>
    </div>
  </div>
);

const HorizontalCatalogCard: React.FC<{ property: Property, onClick: () => void }> = ({ property, onClick }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % property.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav(!isFav);
  };

  return (
    <div onClick={onClick} className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row md:h-[420px] transition-all duration-500 hover:border-orange-500/30 hover:shadow-3xl cursor-pointer">
      <div className="relative w-full md:w-[480px] h-[340px] md:h-full shrink-0 overflow-hidden bg-white/5">
        <img
          src={property.images[currentImg]}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt={property.title}
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"; }}
        />
        <div className={`absolute top-6 left-6 ${property.transaction === TransactionType.PROJECTS ? 'bg-emerald-600/80' : 'bg-black/60'} backdrop-blur-xl px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-white tracking-widest z-10`}>{property.transaction}</div>

        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={prevImg} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"><ChevronLeft size={18} /></button>
          <button onClick={nextImg} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
          {property.images.map((_, idx) => (
            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImg ? 'bg-orange-500 w-4' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col justify-between h-full min-w-0">
        <div>
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-4xl font-black tracking-tight text-white italic uppercase">{property.currency} {property.price.toLocaleString()}</h4>
            <button onClick={toggleFav} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isFav ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
              <Heart size={20} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>
          <h5 className="text-2xl font-black mb-3 uppercase italic text-white leading-tight group-hover:text-orange-500 transition-colors line-clamp-2">{property.title}</h5>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8"><MapPin size={12} className="text-orange-500 shrink-0" /> <span className="truncate">{property.address}, {property.neighborhood}, {property.city}</span></p>

          <div className="flex flex-wrap gap-8 text-[11px] font-black uppercase border-y border-white/5 py-6">
            <div className="flex items-center gap-2 text-white"><Maximize size={16} className="text-orange-500" /> <span>{property.area} m²</span></div>
            <div className="flex items-center gap-2 text-white"><Bed size={16} className="text-orange-500" /> <span>{property.bedrooms || '-'} Dorm.</span></div>
            <div className="flex items-center gap-2 text-white"><Bath size={16} className="text-orange-500" /> <span>{property.bathrooms || '-'} Baños</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-auto pt-8">
          <button className="flex-1 py-5 bg-orange-600 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/10">Ver Ficha Completa</button>
          <button className="w-16 h-14 border border-emerald-500/30 text-emerald-500 rounded-[1.2rem] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shrink-0"><MessageCircle size={20} /></button>
        </div>
      </div>
    </div>
  );
};

const PropertyDetailPage: React.FC<{ property: Property, onClose: () => void, onOpenOther: (p: Property) => void, onAiConsult: () => void, aiMessage: string, setAiMessage: (s: string) => void, aiResponse: string }> = ({ property, onClose, onOpenOther, onAiConsult, aiMessage, setAiMessage, aiResponse }) => (
  <div className="bg-[#050505] text-white pt-32 pb-20 animate-in fade-in duration-500">
    <div className="container mx-auto px-6 max-w-7xl">
      <button onClick={onClose} className="w-fit flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors"><ChevronLeft size={16} /> Volver al listado</button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12 h-[500px]">
        <div className="md:col-span-2 relative h-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 group cursor-zoom-in">
          <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"; }} />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 grid-rows-2 gap-3 h-full">
          {property.images.slice(1, 5).map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 group cursor-zoom-in">
              <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Detail" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"; }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col mb-10">
        <h1 className="text-5xl font-black tracking-tighter italic uppercase mb-6 text-white leading-none">{property.title}</h1>
        <div className="flex items-center gap-6">
          <div className={`px-6 py-2 rounded-xl text-sm font-black uppercase italic ${property.transaction === TransactionType.PROJECTS ? 'bg-emerald-600' : 'bg-orange-600'} text-white`}>{property.transaction}</div>
          <h2 className="text-4xl font-black text-orange-500 italic uppercase">{property.currency} {property.price.toLocaleString()}</h2>
        </div>
        <p className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest mt-8">
          <MapPin className="text-orange-500" size={20} />
          {property.address}, {property.neighborhood}, {property.city}
        </p>
      </div>

      <div className="w-full h-[550px] bg-gray-100 rounded-[3rem] mb-16 relative overflow-hidden group shadow-2xl border-4 border-white/5">
        <LeafletMap property={property} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-20 border-y border-white/10 py-12">
        <DetailStat icon={<Maximize />} label="Superficie" value={`${property.area} m²`} />
        <DetailStat icon={<Bed />} label="Dormitorios" value={property.bedrooms || '-'} />
        <DetailStat icon={<Bath />} label="Baños" value={property.bathrooms || '-'} />
        <DetailStat icon={<Car />} label="Cocheras" value={property.parking || '0'} />
        <DetailStat icon={<ShieldCheck />} label="Seguridad" value={property.isPrivateBarrio ? 'Barrio Cerrado' : 'Recinto Seguro'} />
        <DetailStat icon={<Calendar />} label="Publicado" value="Reciente" />
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          <div className="mb-20">
            <h3 className="text-2xl font-black uppercase italic mb-8 border-b-2 border-orange-500 w-fit">Memoria Descriptiva</h3>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-4xl">{property.description}</p>
          </div>

          {property.transaction === TransactionType.PROJECTS && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-12 rounded-[3rem] mb-20">
              <h4 className="text-2xl font-black uppercase italic text-emerald-500 mb-6 flex items-center gap-3"><Info size={24} /> Información del Proyecto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/40 p-6 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Estado de Obra</p>
                  <p className="text-lg font-black text-white italic">En Pozo / Preventa</p>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Entrega Estimada</p>
                  <p className="text-lg font-black text-white italic">Diciembre 2026</p>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Unidades Totales</p>
                  <p className="text-lg font-black text-white italic">45 Unidades</p>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Financiación</p>
                  <p className="text-lg font-black text-white italic">30% entrega + 48 cuotas</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-12 mb-20">
            {property.panoramicUrl && (
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                <PanoramicViewer imageUrl={property.panoramicUrl} />
              </div>
            )}
            {property.videoUrl && (
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                <VideoTour videoUrl={property.videoUrl} />
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] p-12 rounded-[4rem] mb-20 border border-white/10">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="text-orange-500" size={32} />
              <h4 className="text-3xl font-black uppercase tracking-tighter italic text-white">Asesor AI Premium</h4>
            </div>
            <div className="flex gap-4">
              <input type="text" placeholder="Haz una pregunta sobre esta propiedad o proyecto..." className="flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 text-white" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} />
              <button onClick={onAiConsult} className="bg-orange-600 text-white px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-orange-700 transition-all">Consultar</button>
            </div>
            {aiResponse && <div className="mt-8 p-8 bg-black/60 border border-white/5 rounded-3xl italic text-gray-400 text-sm leading-relaxed border-l-8 border-orange-500 animate-in slide-in-from-left-4">{aiResponse}</div>}
          </div>

          <MortgageCalculator price={property.price} />
        </div>
        <aside className="lg:w-[400px]">
          <div className="sticky top-40 bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-10 shadow-3xl">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8 text-white">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600"><User size={32} /></div>
              <div><h5 className="text-lg font-black uppercase italic">Agente SaltaProp</h5><p className="text-orange-500 text-[10px] font-black uppercase">Verificado</p></div>
            </div>
            <button className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-orange-700 transition-all mb-4">Solicitar Información</button>
            <button className="w-full border-2 border-emerald-500 text-emerald-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"><MessageCircle size={18} /> WhatsApp</button>
            <div className="mt-8 text-center"><button className="text-[10px] font-black uppercase text-gray-600 hover:text-white transition-colors">Ver teléfono del agente</button></div>
          </div>
        </aside>
      </div>
    </div>
  </div>
);

const DetailStat = ({ icon, label, value }: { icon: any, label: string, value: any }) => (
  <div className="flex flex-col items-start gap-2">
    <div className="text-orange-500 mb-2">{React.cloneElement(icon, { size: 28 })}</div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 leading-none">{label}</p>
    <p className="text-xl font-black uppercase italic tracking-tighter text-white">{value}</p>
  </div>
);

export default App;
