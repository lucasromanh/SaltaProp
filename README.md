<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SaltaProp - Premium Real Estate Platform

Una plataforma inmobiliaria premium para Salta, Argentina. Conectamos sueños con hogares a través de tecnología y transparencia.

## 🚀 Características

- ✨ **Diseño Premium**: Interfaz moderna con animaciones suaves y efectos glassmorphism
- 📱 **100% Responsive**: Optimizado para móviles, tablets y desktop
- 🔍 **Búsqueda Inteligente**: Filtros avanzados diseñados para la realidad de Salta
- 🗺️ **Mapas Interactivos**: Integración con Leaflet para visualización de propiedades
- 🤖 **Asistente IA**: Consultas inteligentes sobre propiedades usando Gemini AI
- 💰 **Calculadora de Hipoteca**: Herramienta integrada para calcular financiamiento
- 🌐 **Conversor de Moneda**: Widget en tiempo real para conversión USD/ARS

## 🛠️ Tecnologías

- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework de estilos utility-first
- **Leaflet** - Mapas interactivos
- **Lucide React** - Iconos modernos
- **Google Gemini AI** - Asistente inteligente

## 📋 Prerequisitos

- Node.js (v18 o superior)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd SaltaProp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```
   
   Puedes obtener tu API key de Gemini en: https://ai.google.dev/

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Build para Producción

Para crear un build optimizado para producción:

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

Para previsualizar el build de producción:

```bash
npm run preview
```

## 📱 Optimizaciones Móviles

El proyecto incluye optimizaciones específicas para dispositivos móviles:

- **Touch-friendly**: Todos los elementos interactivos tienen un tamaño mínimo de 44px
- **Viewport optimizado**: Meta tags configurados para prevenir zoom no deseado
- **Safe area insets**: Soporte para dispositivos con notch
- **Performance**: Animaciones optimizadas y lazy loading de imágenes
- **Responsive images**: Todas las imágenes se adaptan automáticamente

## 🎨 Estructura del Proyecto

```
SaltaProp/
├── components/          # Componentes reutilizables
│   ├── FilterSidebar.tsx
│   ├── FloatingUI.tsx
│   └── PropertyViewers.tsx
├── services/           # Servicios y APIs
│   └── geminiService.ts
├── App.tsx            # Componente principal
├── constants.tsx      # Constantes y datos mock
├── types.ts          # Definiciones de tipos TypeScript
├── styles.css        # Estilos responsive personalizados
├── index.html        # HTML principal
├── index.tsx         # Punto de entrada
└── vite.config.ts    # Configuración de Vite
```

## 🎯 Arquitectura MVC

El proyecto mantiene una arquitectura MVC (Model-View-Controller):

- **Model**: `types.ts`, `constants.tsx` - Definiciones de datos y modelos
- **View**: `App.tsx`, `components/` - Componentes de UI
- **Controller**: `services/` - Lógica de negocio y servicios

## 🌟 Características Destacadas

### Búsqueda Inteligente
- Filtros por tipo de propiedad, transacción, ubicación
- Sugerencias automáticas de ciudades
- Búsqueda en tiempo real

### Visualización de Propiedades
- Vista de catálogo con paginación
- Vista detallada con galería de imágenes
- Tours virtuales y vistas panorámicas
- Mapas interactivos con marcadores personalizados

### Asistente IA
- Consultas en lenguaje natural sobre propiedades
- Recomendaciones personalizadas
- Información detallada sobre zonas y barrios

## 🚀 Deploy

El proyecto puede ser desplegado en cualquier servicio de hosting estático:

- **Vercel**: `vercel deploy`
- **Netlify**: Arrastra la carpeta `dist/`
- **GitHub Pages**: Configura el workflow de GitHub Actions
- **Hosting tradicional**: Sube el contenido de `dist/` a tu servidor

## 📄 Licencia

© 2026 SaltaProp Premium Real Estate. Todos los derechos reservados.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📞 Contacto

Para más información, visita nuestra plataforma o contacta con el equipo de desarrollo.

---

Desarrollado con ❤️ para el mercado inmobiliario de Salta
