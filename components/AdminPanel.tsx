import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Image as ImageIcon, CheckCircle, AlertCircle, X, Home, DollarSign, MapPin, Building, Key, LayoutDashboard, LogOut, Edit2, Trash2 } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'hero' | 'property' | 'manage'>('manage');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  // Property Form State
  const [propData, setPropData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    type: 'Departamento',
    transaction: 'Venta',
    address: '',
    neighborhood: '',
    city: 'Salta Capital',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    area: '',
    amenities: [] as string[]
  });
  const [propImages, setPropImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hero State
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleHeroSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setHeroPreview(base64);
  };

  const handleHeroUpload = async () => {
    if (!heroPreview) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/upload-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: heroPreview })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('¡Imagen de portada (Hero) actualizada con éxito! Cerrá el panel para verla.');
        setHeroPreview(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al subir la imagen');
    }
    setLoading(false);
  };

  const handlePropertyImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    setLoading(true);
    const newBase64Images = [];
    for (const file of files) {
      const base64 = await fileToBase64(file);
      newBase64Images.push(base64);
    }
    setPropImages(prev => [...prev, ...newBase64Images]);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setPropImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditProperty = (prop: any) => {
    setPropData({
      title: prop.title,
      description: prop.description,
      price: prop.price.toString(),
      currency: prop.currency,
      type: prop.type === 'APARTMENT' ? 'Departamento' : prop.type === 'HOUSE' ? 'Casa' : prop.type === 'LAND' ? 'Terreno' : 'Proyecto',
      transaction: prop.transaction === 'BUY' ? 'Venta' : 'Alquiler',
      address: prop.address,
      neighborhood: prop.neighborhood,
      city: prop.city,
      bedrooms: prop.bedrooms?.toString() || '',
      bathrooms: prop.bathrooms?.toString() || '',
      parking: prop.parking?.toString() || '',
      area: prop.area?.toString() || '',
      amenities: prop.amenities || []
    });
    setPropImages(prop.images || []);
    setEditingId(prop.id);
    setActiveTab('property');
  };

  const confirmDeleteProperty = async () => {
    if (!deleteModalId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/delete-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteModalId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Propiedad eliminada. Los cambios se aplicaron, puede que necesites refrescar la página para verlos.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al eliminar');
    }
    setLoading(false);
    setDeleteModalId(null);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (propImages.length === 0) {
      setError('Debes subir al menos una imagen de la propiedad.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...propData,
        id: editingId || undefined,
        price: Number(propData.price),
        bedrooms: Number(propData.bedrooms),
        bathrooms: Number(propData.bathrooms),
        parking: Number(propData.parking),
        area: Number(propData.area),
        images: propImages
      };

      const endpoint = editingId ? '/api/update-property' : '/api/add-property';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess(editingId ? '¡Propiedad actualizada exitosamente!' : '¡Propiedad guardada y publicada exitosamente!');
        setPropData({
          title: '', description: '', price: '', currency: 'USD', type: 'Departamento', transaction: 'Venta', address: '', neighborhood: '', city: 'Salta Capital', bedrooms: '', bathrooms: '', parking: '', area: '', amenities: []
        });
        setPropImages([]);
        setEditingId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError('Error al guardar la propiedad');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#050505] flex items-center justify-center p-6 animate-in fade-in">
        <div className="absolute top-6 right-6">
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={32} /></button>
        </div>
        <div className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-brand-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Key size={36} className="text-brand-500" />
            </div>
            <h2 className="text-3xl font-black italic uppercase">Lares Admin</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Acceso Restringido</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
            
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Email Corporativo</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none transition-colors" placeholder="dani@mail.com" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none transition-colors" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl py-5 mt-8 transition-colors shadow-xl shadow-brand-600/20">
              {loading ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#050505] overflow-hidden flex flex-col animate-in fade-in">
      {/* Top Navbar Admin */}
      <header className="bg-[#0a0a0a] border-b border-white/10 py-4 px-6 md:px-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase leading-none">Lares Admin</h1>
            <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest">Panel de Gestión</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
            <LogOut size={16} /> Cerrar Sesión
          </button>
          <button onClick={onClose} className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-brand-600 hover:border-brand-600 transition-colors">
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto">

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-6 rounded-3xl flex items-center gap-4 mb-10 shadow-lg">
              <CheckCircle size={32} className="shrink-0" />
              <div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-1">¡Éxito!</h4>
                <p className="font-medium text-emerald-500/80">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-3xl flex items-center gap-4 mb-10 shadow-lg">
              <AlertCircle size={32} className="shrink-0" />
              <div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-1">Error</h4>
                <p className="font-medium text-red-500/80">{error}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-10">
            <button onClick={() => { setActiveTab('manage'); setEditingId(null); }} className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${activeTab === 'manage' ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}>
              <LayoutDashboard size={16} /> Gestionar Propiedades
            </button>
            <button onClick={() => { 
                setActiveTab('property'); 
                setEditingId(null); 
                setPropData({ title: '', description: '', price: '', currency: 'USD', type: 'Departamento', transaction: 'Venta', address: '', neighborhood: '', city: 'Salta Capital', bedrooms: '', bathrooms: '', parking: '', area: '', amenities: [] }); 
                setPropImages([]); 
              }} 
              className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${activeTab === 'property' && !editingId ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
            >
              <Building size={16} /> Nueva Propiedad
            </button>
            <button onClick={() => setActiveTab('hero')} className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 ${activeTab === 'hero' ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}>
              <ImageIcon size={16} /> Cambiar Portada (Hero)
            </button>
          </div>

          {/* TAB: MANAGE */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12">
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic mb-2">Propiedades Publicadas</h2>
                    <p className="text-gray-500 text-sm">Gestiona, edita o elimina las propiedades existentes.</p>
                  </div>
                  <div className="text-brand-500 bg-brand-500/10 px-4 py-2 rounded-xl text-sm font-bold">Total: {MOCK_PROPERTIES.length}</div>
                </div>

                <div className="space-y-4">
                  {MOCK_PROPERTIES.map(prop => (
                    <div key={prop.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={prop.images[0]} alt={prop.title} className="w-16 h-16 object-cover rounded-xl" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200"; }} />
                        <div>
                          <h4 className="text-white font-bold uppercase italic tracking-tighter max-w-[200px] sm:max-w-md truncate">{prop.title}</h4>
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest">{prop.city} - {prop.currency} {prop.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleEditProperty(prop)} className="w-10 h-10 bg-white/5 hover:bg-brand-600 text-white rounded-full flex items-center justify-center transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteModalId(prop.id)} className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {MOCK_PROPERTIES.length === 0 && (
                    <p className="text-center text-gray-500 py-10 italic">No hay propiedades publicadas aún.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-8">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12">
                <div className="mb-10">
                  <h2 className="text-3xl font-black uppercase italic mb-2">Imagen de Portada Actual</h2>
                  <p className="text-gray-500 text-sm">Esta es la imagen que los usuarios ven al ingresar al sitio principal.</p>
                </div>
                
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 relative">
                  <img src="/images/hero-bg.jpg" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2400"; }} alt="Hero Actual" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white">Vista Actual en la Web</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-brand-500/30 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-brand-500/5">
                <div className="mb-10">
                  <h2 className="text-3xl font-black uppercase italic mb-2 text-brand-500">Subir Nueva Portada</h2>
                  <p className="text-gray-400 text-sm">Seleccioná una nueva imagen horizontal de alta calidad. Al confirmar, reemplazará a la actual.</p>
                </div>

                {!heroPreview ? (
                  <div className="border-2 border-dashed border-white/20 rounded-3xl p-16 text-center hover:border-brand-500 transition-colors bg-white/5 cursor-pointer flex flex-col items-center justify-center group" onClick={() => heroInputRef.current?.click()}>
                    <div className="w-20 h-20 bg-white/5 group-hover:bg-brand-500/20 rounded-full flex items-center justify-center mb-6 transition-colors">
                      <ImageIcon size={32} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <p className="text-white font-black text-xl uppercase italic mb-3">Tocar para buscar archivo</p>
                    <p className="text-gray-500 text-sm font-medium">Recomendado: 1920x1080px (JPG, PNG). Máx 10MB.</p>
                    <input type="file" accept="image/*" className="hidden" ref={heroInputRef} onChange={handleHeroSelect} />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="aspect-video w-full rounded-3xl overflow-hidden border-2 border-brand-500 relative">
                      <img src={heroPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 flex items-end p-8">
                        <div>
                          <p className="text-brand-500 font-black uppercase tracking-widest text-xs mb-2">Vista Previa</p>
                          <h3 className="text-4xl font-black text-white italic uppercase">Así se verá tu web</h3>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={handleHeroUpload} disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-brand-600/20">
                        {loading ? 'Guardando...' : 'Confirmar y Guardar Nueva Portada'}
                      </button>
                      <button onClick={() => setHeroPreview(null)} disabled={loading} className="px-8 py-5 border border-white/20 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PROPERTY */}
          {activeTab === 'property' && (
            <form onSubmit={handleAddProperty} className="space-y-8">
              
              {/* Card 1: Información Básica */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <Home size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic">Información Principal</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Lo primero que verá el cliente</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Título Público (Ej: Casa de Lujo en San Lorenzo)</label>
                    <input type="text" required value={propData.title} onChange={e => setPropData({...propData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none text-lg font-medium transition-all" placeholder="Escribí un título llamativo..." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Tipo de Inmueble</label>
                      <select value={propData.type} onChange={e => setPropData({...propData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none font-bold appearance-none cursor-pointer">
                        <option value="Departamento" className="bg-[#0a0a0a] text-white">Departamento</option>
                        <option value="Casa" className="bg-[#0a0a0a] text-white">Casa</option>
                        <option value="Terreno" className="bg-[#0a0a0a] text-white">Terreno</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Operación</label>
                      <select value={propData.transaction} onChange={e => setPropData({...propData, transaction: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none font-bold appearance-none cursor-pointer">
                        <option value="Venta" className="bg-[#0a0a0a] text-white">Venta</option>
                        <option value="Alquiler" className="bg-[#0a0a0a] text-white">Alquiler</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Moneda</label>
                      <select value={propData.currency} onChange={e => setPropData({...propData, currency: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none font-bold appearance-none cursor-pointer">
                        <option value="USD" className="bg-[#0a0a0a] text-white">USD (Dólares)</option>
                        <option value="ARS" className="bg-[#0a0a0a] text-white">ARS (Pesos)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Precio</label>
                      <div className="relative">
                        <DollarSign size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="number" required value={propData.price} onChange={e => setPropData({...propData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white focus:border-brand-500 outline-none text-xl font-black tracking-wider transition-all" placeholder="120000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Ubicación y Detalles */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <MapPin size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic">Ubicación y Ficha Técnica</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Dónde es y qué tiene</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Dirección Exacta (Será el nombre de la carpeta)</label>
                      <input type="text" required value={propData.address} onChange={e => setPropData({...propData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none font-medium" placeholder="Ej: Los Avellanos 379" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Barrio / Zona</label>
                      <input type="text" required value={propData.neighborhood} onChange={e => setPropData({...propData, neighborhood: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-brand-500 outline-none font-medium" placeholder="Ej: Tres Cerritos" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Superficie Total</label>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand-500 transition-colors">
                        <input type="number" required value={propData.area} onChange={e => setPropData({...propData, area: e.target.value})} className="w-full bg-transparent border-none outline-none text-white font-bold text-center" placeholder="0" />
                        <span className="text-gray-500 text-xs font-black">m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Dormitorios</label>
                      <input type="number" required value={propData.bedrooms} onChange={e => setPropData({...propData, bedrooms: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none font-bold text-center" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Baños</label>
                      <input type="number" required value={propData.bathrooms} onChange={e => setPropData({...propData, bathrooms: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none font-bold text-center" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Cocheras</label>
                      <input type="number" required value={propData.parking} onChange={e => setPropData({...propData, parking: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none font-bold text-center" placeholder="0" />
                    </div>
                  </div>

                  <div className={`border p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${propData.amenities.includes('Apto crédito') ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`} onClick={() => {
                      if (propData.amenities.includes('Apto crédito')) setPropData({...propData, amenities: propData.amenities.filter(a => a !== 'Apto crédito')});
                      else setPropData({...propData, amenities: [...propData.amenities, 'Apto crédito']});
                    }}>
                    <div>
                      <h4 className={`font-black uppercase italic ${propData.amenities.includes('Apto crédito') ? 'text-emerald-500' : 'text-gray-400'}`}>Apto Crédito Hipotecario</h4>
                      <p className="text-white/60 text-xs font-medium mt-1">Marcá esta opción si la propiedad es apta para préstamos del banco.</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${propData.amenities.includes('Apto crédito') ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 text-transparent'}`}>
                      <CheckCircle size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Descripción Completa</label>
                    <textarea required value={propData.description} onChange={e => setPropData({...propData, description: e.target.value})} rows={8} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:border-brand-500 outline-none leading-relaxed font-medium resize-none transition-all" placeholder="Escribí aquí todo el texto promocional de la propiedad... Podés usar saltos de línea."></textarea>
                  </div>
                </div>
              </div>

              {/* Card 3: Fotos */}
              <div className="bg-[#0a0a0a] border border-brand-500/30 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-brand-500/5">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-brand-500">Galería de Imágenes</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Minimo 1 foto obligatoria</p>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="hidden sm:flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors">
                    <Plus size={16} /> Agregar Fotos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {propImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-white/10 group shadow-lg">
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Preview ${idx}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(idx)} className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-xl">
                          <X size={24} />
                        </button>
                      </div>
                      {idx === 0 && <span className="absolute top-3 left-3 bg-brand-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Principal</span>}
                    </div>
                  ))}
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-500/5 transition-all cursor-pointer">
                    <Plus size={32} className="mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Click para subir<br/>más fotos</span>
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePropertyImages} />
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <AlertCircle size={16} className="text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Al confirmar, las imágenes se procesarán y guardarán en el servidor dentro de la carpeta: <br/>
                    <code className="text-brand-500 font-bold bg-brand-500/10 px-2 py-0.5 rounded mt-1 inline-block">public/images/propiedades/[Tipo]/[Dirección Exacta]/</code>
                  </p>
                </div>
              </div>

              {/* Botón Final */}
              <div className="pt-6 pb-12">
                <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xl md:text-2xl font-black uppercase italic rounded-3xl py-8 transition-all shadow-2xl shadow-brand-600/30 flex justify-center items-center gap-4">
                  {loading ? (
                    <span className="animate-pulse">Procesando archivos y guardando base de datos...</span>
                  ) : (
                    <>
                      <Upload size={28} />
                      {editingId ? 'Guardar Cambios' : 'Publicar Propiedad en la Web'}
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
      {/* Modal de Confirmación de Eliminación */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-[#0d0d0d] border border-red-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-white mb-2">¿Eliminar Propiedad?</h3>
            <p className="text-gray-400 mb-8 font-medium">Esta acción es irreversible y borrará la propiedad de la base de datos pública de inmediato.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setDeleteModalId(null)} 
                disabled={loading}
                className="flex-1 px-6 py-4 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteProperty} 
                disabled={loading}
                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-600/20"
              >
                {loading ? 'Borrando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
