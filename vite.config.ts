import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';

// Plugin de Vite para manejar el API del Panel de Admin (solo en local)
const adminApiPlugin = () => {
  return {
    name: 'admin-api',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '50mb' }));

      // Endpoint: Autenticación
      app.post('/api/login', (req, res) => {
        const { email, password } = req.body;
        if (email === 'dani@mail.com' && password === '1234') {
          res.json({ success: true, token: 'fake-admin-token' });
        } else {
          res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
      });

      // Endpoint: Cambiar Hero Image
      app.post('/api/upload-hero', (req, res) => {
        try {
          const { base64 } = req.body;
          if (!base64) return res.status(400).json({ error: 'No image provided' });
          const matches = base64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) return res.status(400).json({ error: 'Invalid base64' });
          
          const buffer = Buffer.from(matches[2], 'base64');
          const heroPath = path.join(__dirname, 'public', 'images', 'hero-bg.jpg');
          fs.writeFileSync(heroPath, buffer);
          res.json({ success: true, message: 'Hero actualizado' });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      });

      // Endpoint: Agregar Propiedad
      app.post('/api/add-property', (req, res) => {
        try {
          const prop = req.body;
          
          // Mapear tipo a nombre de carpeta
          let folderType = 'departamentos';
          if (prop.type === 'Casa') folderType = 'casas';
          if (prop.type === 'Terreno') folderType = 'terrenos';
          if (prop.type === 'Proyecto') folderType = 'proyectos';

          const dirPath = path.join(__dirname, 'public', 'images', 'propiedades', folderType, prop.address);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          const savedImages = [];
          if (prop.images && prop.images.length > 0) {
            prop.images.forEach((imgBase64, index) => {
              const matches = imgBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
              if (matches && matches.length === 3) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const fileName = `img-${index + 1}.${ext}`;
                const filePath = path.join(dirPath, fileName);
                fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                
                // Generar ruta web asegurando que los espacios estén codificados
                const webPath = `/images/propiedades/${folderType}/${encodeURIComponent(prop.address)}/${fileName}`;
                savedImages.push(webPath);
              }
            });
          }

          // Actualizar constants.tsx
          const constantsPath = path.join(__dirname, 'constants.tsx');
          let constantsContent = fs.readFileSync(constantsPath, 'utf8');

          const newPropObj = `{
    id: 'LARES-${Date.now()}',
    title: '${prop.title}',
    description: \`${prop.description}\`,
    price: ${prop.price},
    currency: '${prop.currency}',
    type: PropertyType.${prop.type === 'Departamento' ? 'APARTMENT' : prop.type === 'Casa' ? 'HOUSE' : prop.type === 'Terreno' ? 'LAND' : 'PROJECTS'},
    transaction: TransactionType.${prop.transaction === 'Venta' ? 'BUY' : 'RENT'},
    address: '${prop.address}',
    neighborhood: '${prop.neighborhood}',
    city: '${prop.city}',
    bedrooms: ${prop.bedrooms || 0},
    bathrooms: ${prop.bathrooms || 0},
    parking: ${prop.parking || 0},
    area: ${prop.area || 0},
    images: ${JSON.stringify(savedImages, null, 6).replace(/"/g, "'")},
    coordinates: [-24.7821, -65.4232],
    featured: true,
    amenities: ${JSON.stringify(prop.amenities || [])},
    isPrivateBarrio: false,
    advertiserType: 'Inmobiliaria',
  },`;

          // Insertar al principio de MOCK_PROPERTIES
          const insertIndex = constantsContent.indexOf('export const MOCK_PROPERTIES: Property[] = [') + 44;
          constantsContent = constantsContent.slice(0, insertIndex) + '\n  ' + newPropObj + constantsContent.slice(insertIndex);

          fs.writeFileSync(constantsPath, constantsContent);

          res.json({ success: true, message: 'Propiedad agregada' });
        } catch (e) {
          console.error(e);
          res.status(500).json({ error: e.message });
        }
      });

      // Endpoint: Eliminar Propiedad
      app.post('/api/delete-property', (req, res) => {
        try {
          const { id } = req.body;
          if (!id) return res.status(400).json({ error: 'Falta el ID' });

          const constantsPath = path.join(__dirname, 'constants.tsx');
          let constantsContent = fs.readFileSync(constantsPath, 'utf8');

          const regex = new RegExp(`\\s*\\{\\s*id:\\s*['"]${id}['"][\\s\\S]*?\\n\\s*\\},?`);
          constantsContent = constantsContent.replace(regex, '');

          fs.writeFileSync(constantsPath, constantsContent);
          res.json({ success: true, message: 'Propiedad eliminada' });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      });

      // Endpoint: Actualizar Propiedad
      app.post('/api/update-property', (req, res) => {
        try {
          const prop = req.body;
          const { id } = prop;
          if (!id) return res.status(400).json({ error: 'Falta el ID' });

          let folderType = 'departamentos';
          if (prop.type === 'Casa') folderType = 'casas';
          if (prop.type === 'Terreno') folderType = 'terrenos';
          if (prop.type === 'Proyecto') folderType = 'proyectos';

          const dirPath = path.join(__dirname, 'public', 'images', 'propiedades', folderType, prop.address);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          const savedImages = [];
          if (prop.images && prop.images.length > 0) {
            prop.images.forEach((img, index) => {
              if (img.startsWith('data:image')) {
                const matches = img.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                  const fileName = `img-${Date.now()}-${index + 1}.${ext}`;
                  const filePath = path.join(dirPath, fileName);
                  fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
                  const webPath = `/images/propiedades/${folderType}/${encodeURIComponent(prop.address)}/${fileName}`;
                  savedImages.push(webPath);
                }
              } else {
                savedImages.push(img); // ya es una URL guardada
              }
            });
          }

          const constantsPath = path.join(__dirname, 'constants.tsx');
          let constantsContent = fs.readFileSync(constantsPath, 'utf8');

          const newPropObj = `{
    id: '${id}',
    title: '${prop.title}',
    description: \`${prop.description}\`,
    price: ${prop.price},
    currency: '${prop.currency}',
    type: PropertyType.${prop.type === 'Departamento' ? 'APARTMENT' : prop.type === 'Casa' ? 'HOUSE' : prop.type === 'Terreno' ? 'LAND' : 'PROJECTS'},
    transaction: TransactionType.${prop.transaction === 'Venta' ? 'BUY' : 'RENT'},
    address: '${prop.address}',
    neighborhood: '${prop.neighborhood}',
    city: '${prop.city}',
    bedrooms: ${prop.bedrooms || 0},
    bathrooms: ${prop.bathrooms || 0},
    parking: ${prop.parking || 0},
    area: ${prop.area || 0},
    images: ${JSON.stringify(savedImages, null, 6).replace(/"/g, "'")},
    coordinates: [-24.7821, -65.4232],
    featured: true,
    amenities: ${JSON.stringify(prop.amenities || [])},
    isPrivateBarrio: false,
    advertiserType: 'Inmobiliaria',
  },`;

          // Reemplazar la propiedad existente
          const regex = new RegExp(`\\s*\\{\\s*id:\\s*['"]${id}['"][\\s\\S]*?\\n\\s*\\},?`);
          constantsContent = constantsContent.replace(regex, '\\n  ' + newPropObj);

          fs.writeFileSync(constantsPath, constantsContent);
          res.json({ success: true, message: 'Propiedad actualizada' });
        } catch (e) {
          console.error(e);
          res.status(500).json({ error: e.message });
        }
      });

      server.middlewares.use(app);
    }
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), adminApiPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
