
import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Search, 
  MapPin, 
  Video, 
  RotateCw, 
  Layout,
  Plus
} from 'lucide-react';
import { PropertyType, TransactionType, FilterState } from '../types';
import { SALTA_CITIES } from '../constants';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onClear: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, onClear }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['operacion', 'inmueble', 'habitaciones', 'superficie', 'ambientes', 'publicacion']);
  const [showAllAntiguedad, setShowAllAntiguedad] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAmenityToggle = (amenity: string) => {
    const updated = filters.selectedAmenities.includes(amenity)
      ? filters.selectedAmenities.filter(a => a !== amenity)
      : [...filters.selectedAmenities, amenity];
    setFilters({ ...filters, selectedAmenities: updated });
  };

  const OptionBtn = ({ label, value, current, onClick }: any) => (
    <button
      onClick={() => onClick(value)}
      className={`flex-1 py-3 text-[10px] font-bold uppercase border transition-all ${current === value ? 'bg-orange-600 border-orange-600 text-white' : 'bg-transparent border-white/10 text-gray-400 hover:border-orange-500/50'}`}
    >
      {label}
    </button>
  );

  const RadioItem = ({ label, value, current, name, onChange }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <div className="relative flex items-center justify-center">
        <input 
          type="radio" 
          name={name} 
          checked={current === value} 
          onChange={() => onChange(value)}
          className="appearance-none w-5 h-5 rounded-full border border-white/20 checked:border-orange-600 transition-all" 
        />
        {current === value && <div className="absolute w-2.5 h-2.5 bg-orange-600 rounded-full" />}
      </div>
      <span className={`text-[11px] font-bold transition-colors ${current === value ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</span>
    </label>
  );

  const CheckboxItem = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="appearance-none w-5 h-5 rounded-md border border-white/20 checked:border-orange-600 transition-all" 
        />
        {checked && <div className="absolute w-2.5 h-2.5 bg-orange-600 rounded-sm" />}
      </div>
      <span className={`text-[11px] font-bold transition-colors ${checked ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</span>
    </label>
  );

  const handleVerResultados = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#0d0d0d] border border-white/10 rounded-[2rem] flex flex-col h-full shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
          <SlidersHorizontal size={18} className="text-orange-500" /> Filtros
        </h4>
        <button onClick={onClear} className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-400 transition-colors">Limpiar</button>
      </div>

      <div className="p-8 flex-1 space-y-10 custom-scrollbar overflow-y-auto">
        {/* Operación */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Operación</h5>
          <div className="flex rounded-xl overflow-hidden">
            <OptionBtn label="Compra" value={TransactionType.BUY} current={filters.transaction} onClick={(v: any) => setFilters({...filters, transaction: v})} />
            <OptionBtn label="Alquiler" value={TransactionType.RENT} current={filters.transaction} onClick={(v: any) => setFilters({...filters, transaction: v})} />
            <OptionBtn label="Proyectos" value="PROYECTOS" current={filters.transaction} onClick={(v: any) => setFilters({...filters, transaction: v})} />
          </div>
        </div>

        {/* Tipo de Inmueble */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Tipo de inmueble</h5>
          <div className="relative">
            <select 
              value={filters.type} 
              onChange={(e) => setFilters({...filters, type: e.target.value as any})} 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white focus:border-orange-500 outline-none appearance-none"
            >
              <option value="" className="bg-black">Todos los tipos</option>
              {Object.values(PropertyType).map(pt => <option key={pt} value={pt} className="bg-black">{pt}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Habitaciones */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Habitaciones</h5>
          <div className="flex rounded-xl overflow-hidden">
            {['1+', '2+', '3+', '4+', '5+'].map(val => (
              <OptionBtn key={val} label={val} value={val} current={filters.bedrooms} onClick={(v: string) => setFilters({...filters, bedrooms: v})} />
            ))}
          </div>
        </div>

        {/* Superficie */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Superficie</h5>
          <div className="flex gap-6">
            <RadioItem label="Techada" value="Techada" current={filters.surfaceType} name="stype" onChange={(v: any) => setFilters({...filters, surfaceType: v})} />
            <RadioItem label="Total" value="Total" current={filters.surfaceType} name="stype" onChange={(v: any) => setFilters({...filters, surfaceType: v})} />
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] font-bold text-white flex items-center gap-1">
              m²
            </div>
            <input 
              type="number" 
              placeholder="Desde" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-orange-500 text-white"
              value={filters.surfaceMin}
              onChange={(e) => setFilters({...filters, surfaceMin: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Hasta" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-orange-500 text-white"
              value={filters.surfaceMax}
              onChange={(e) => setFilters({...filters, surfaceMax: e.target.value})}
            />
          </div>
        </div>

        {/* Baños */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Baños</h5>
          <div className="flex rounded-xl overflow-hidden">
            {['1+', '2+', '3+', '4+', '5+'].map(val => (
              <OptionBtn key={val} label={val} value={val} current={filters.bathrooms} onClick={(v: string) => setFilters({...filters, bathrooms: v})} />
            ))}
          </div>
        </div>

        {/* Estacionamientos */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Estacionamientos</h5>
          <div className="flex rounded-xl overflow-hidden">
            {['0', '1+', '2+', '3+', '4+'].map(val => (
              <OptionBtn key={val} label={val} value={val} current={filters.parking} onClick={(v: string) => setFilters({...filters, parking: v})} />
            ))}
          </div>
        </div>

        {/* Tipo de anunciante */}
        <div className="space-y-3">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Tipo de anunciante</h5>
          <div className="space-y-2">
            <RadioItem label="Todos" value="Todos" current={filters.advertiserType} name="adv" onChange={(v: string) => setFilters({...filters, advertiserType: v})} />
            <RadioItem label="Inmobiliaria" value="Inmobiliaria" current={filters.advertiserType} name="adv" onChange={(v: string) => setFilters({...filters, advertiserType: v})} />
            <RadioItem label="Dueño directo" value="Dueño directo" current={filters.advertiserType} name="adv" onChange={(v: string) => setFilters({...filters, advertiserType: v})} />
          </div>
        </div>

        {/* Antigüedad */}
        <div className="space-y-3">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Antigüedad</h5>
          <div className="space-y-2">
            {['En construcción', 'A estrenar', 'Hasta 5 años', 'Más de 5 años'].map(a => (
              <RadioItem key={a} label={a} value={a} current={filters.age} name="age" onChange={(v: string) => setFilters({...filters, age: v})} />
            ))}
            {showAllAntiguedad && (
              <>
                <RadioItem label="Hasta 10 años" value="Hasta 10 años" current={filters.age} name="age" onChange={(v: string) => setFilters({...filters, age: v})} />
                <RadioItem label="Más de 20 años" value="Más de 20 años" current={filters.age} name="age" onChange={(v: string) => setFilters({...filters, age: v})} />
              </>
            )}
          </div>
          <button 
            onClick={() => setShowAllAntiguedad(!showAllAntiguedad)}
            className="text-[9px] font-black text-orange-500 uppercase flex items-center gap-1 hover:text-orange-400 transition-colors"
          >
            {showAllAntiguedad ? 'Ver menos' : 'Ver más'} {showAllAntiguedad ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
          </button>
        </div>

        {/* Fecha de Publicación */}
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('publicacion')}>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Fecha de publicación</h5>
            {expandedSections.includes('publicacion') ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </div>
          {expandedSections.includes('publicacion') && (
            <div className="space-y-2">
              {['Hoy', 'Última semana', 'Último mes', 'Cualquier fecha'].map(d => (
                <RadioItem key={d} label={d} value={d} current={filters.pubDate} name="pubdate" onChange={(v: string) => setFilters({...filters, pubDate: v})} />
              ))}
            </div>
          )}
        </div>

        {/* General */}
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('general')}>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-white">General</h5>
            {expandedSections.includes('general') ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </div>
          {expandedSections.includes('general') && (
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {['Apto crédito', 'Uso profesional', 'Frente', 'Contrafrente', 'Lateral'].map(a => (
                <CheckboxItem key={a} label={a} checked={filters.selectedAmenities.includes(a)} onChange={() => handleAmenityToggle(a)} />
              ))}
            </div>
          )}
        </div>

        {/* Ambientes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('ambientes')}>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Ambientes</h5>
            {expandedSections.includes('ambientes') ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </div>
          {expandedSections.includes('ambientes') && (
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {['Bodega', 'Patio', 'Sala de estar', 'Escritorio', 'Cuarto de servicio', 'Vestidor', 'Depósito', 'Hidromasaje', 'Cocina', 'Comedor', 'Living', 'Quincho', 'Playroom', 'Suite'].map(a => (
                <CheckboxItem key={a} label={a} checked={filters.selectedAmenities.includes(a)} onChange={() => handleAmenityToggle(a)} />
              ))}
            </div>
          )}
        </div>

        {/* Exteriores */}
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('exteriores')}>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Exteriores</h5>
            {expandedSections.includes('exteriores') ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </div>
          {expandedSections.includes('exteriores') && (
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {['Balcón', 'Jardín', 'Terraza', 'Parrilla', 'Pileta', 'Solarium'].map(a => (
                <CheckboxItem key={a} label={a} checked={filters.selectedAmenities.includes(a)} onChange={() => handleAmenityToggle(a)} />
              ))}
            </div>
          )}
        </div>

        {/* Servicios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('servicios')}>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Servicios</h5>
            {expandedSections.includes('servicios') ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </div>
          {expandedSections.includes('servicios') && (
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {['Agua corriente', 'Cloaca', 'Gas natural', 'Internet', 'Luz', 'Pavimento', 'Teléfono', 'Cable'].map(a => (
                <CheckboxItem key={a} label={a} checked={filters.selectedAmenities.includes(a)} onChange={() => handleAmenityToggle(a)} />
              ))}
            </div>
          )}
        </div>

        {/* Multimedia */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">Multimedia</h5>
          <div className="flex flex-wrap gap-2">
            <MediaBtn icon={<RotateCw size={14}/>} label="Recorrido 360" active={filters.multimedia.includes('360')} onClick={() => {}} />
            <MediaBtn icon={<Video size={14}/>} label="Video" active={filters.multimedia.includes('Video')} onClick={() => {}} />
            <MediaBtn icon={<Layout size={14}/>} label="Planos" active={filters.multimedia.includes('Planos')} onClick={() => {}} />
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-white/10 flex gap-4">
        <button onClick={onClear} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Limpiar</button>
        <button 
          onClick={handleVerResultados}
          className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all"
        >
          Ver resultados
        </button>
      </div>
    </div>
  );
};

const MediaBtn = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${active ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/50'}`}
  >
    {icon} {label}
  </button>
);
