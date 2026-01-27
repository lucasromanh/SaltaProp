# Guía de Deployment - SaltaProp

Esta guía te ayudará a desplegar tu aplicación SaltaProp en diferentes plataformas.

## 📦 Preparación del Build

Antes de desplegar, asegúrate de crear un build de producción:

```bash
npm run build
```

Esto generará una carpeta `dist/` con todos los archivos optimizados para producción.

## 🚀 Opciones de Deployment

### 1. Vercel (Recomendado)

Vercel es ideal para aplicaciones React y ofrece deployment automático desde Git.

**Deployment desde CLI:**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Deployment desde Git:**

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Configura las variables de entorno:
   - `GEMINI_API_KEY`: Tu API key de Gemini
5. Deploy automático

**Configuración de variables de entorno en Vercel:**
- Settings → Environment Variables
- Agrega `GEMINI_API_KEY` con tu API key

### 2. Netlify

Netlify ofrece hosting gratuito con CI/CD integrado.

**Deployment manual:**

1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `dist/` a la interfaz web
3. Configura las variables de entorno en Site Settings → Environment

**Deployment desde Git:**

1. Conecta tu repositorio de GitHub
2. Configuración de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Agrega variables de entorno en Site Settings

**netlify.toml** (opcional):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

Para proyectos públicos en GitHub.

**Configuración:**

1. Actualiza `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/nombre-de-tu-repo/',
  // ... resto de la configuración
});
```

2. Instala gh-pages:

```bash
npm install --save-dev gh-pages
```

3. Agrega scripts a `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:

```bash
npm run deploy
```

### 4. Servidor Tradicional (Apache/Nginx)

**Pasos:**

1. Crea el build:
   ```bash
   npm run build
   ```

2. Sube el contenido de `dist/` a tu servidor

3. Configura el servidor web:

**Apache (.htaccess):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**

```nginx
server {
  listen 80;
  server_name tu-dominio.com;
  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Caché para assets estáticos
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### 5. Firebase Hosting

**Configuración:**

1. Instala Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Inicializa Firebase:
   ```bash
   firebase init hosting
   ```

3. Configuración:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - GitHub integration: Opcional

4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### 6. AWS S3 + CloudFront

**Pasos:**

1. Crea un bucket S3
2. Habilita "Static website hosting"
3. Sube el contenido de `dist/`
4. Configura CloudFront para CDN (opcional)
5. Configura las políticas de bucket para acceso público

## 🔐 Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en tu plataforma de hosting:

- `GEMINI_API_KEY`: Tu API key de Google Gemini

**Nota importante:** Nunca subas archivos `.env` con credenciales reales a Git.

## ✅ Checklist Pre-Deployment

- [ ] Build exitoso sin errores (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] Prueba local del build (`npm run preview`)
- [ ] Imágenes optimizadas
- [ ] Meta tags SEO configurados
- [ ] Favicon y assets en su lugar
- [ ] HTTPS habilitado en producción
- [ ] Dominio personalizado configurado (opcional)

## 🔍 Testing Post-Deployment

Después del deployment, verifica:

1. **Funcionalidad básica:**
   - Navegación entre páginas
   - Búsqueda de propiedades
   - Filtros funcionando
   - Mapas cargando correctamente

2. **Responsive:**
   - Prueba en móvil
   - Prueba en tablet
   - Prueba en desktop

3. **Performance:**
   - Lighthouse score > 90
   - Tiempo de carga < 3s
   - Imágenes optimizadas

4. **SEO:**
   - Meta tags presentes
   - Open Graph configurado
   - Sitemap generado (opcional)

## 🐛 Troubleshooting

**Problema:** Rutas no funcionan después del deployment

**Solución:** Configura el servidor para redirigir todas las rutas a `index.html` (ver configuraciones de servidor arriba)

---

**Problema:** Variables de entorno no se cargan

**Solución:** Verifica que las variables estén configuradas en la plataforma de hosting y que tengan el prefijo correcto si es necesario (ej: `VITE_` para Vite)

---

**Problema:** Estilos no se aplican correctamente

**Solución:** Verifica que la ruta base esté configurada correctamente en `vite.config.ts`

## 📊 Monitoreo

Considera implementar:

- **Google Analytics** para tracking de usuarios
- **Sentry** para error tracking
- **Hotjar** para análisis de comportamiento

## 🔄 CI/CD

Para automatizar deployments, configura GitHub Actions:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

¡Tu aplicación SaltaProp está lista para el mundo! 🚀
