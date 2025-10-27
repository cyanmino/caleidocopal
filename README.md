# Caleidocopal

Prototipo de aplicación web offline para visualizar cartas astrales en 3D. El proyecto utiliza React, Three.js y Vite para renderizar una rueda zodiacal tridimensional con capas interactiva que incluyen planetas, asteroides, casas, aspectos y dodecatemorias. También incorpora un gestor local de perfiles y herramientas de exportación a imagen.

## Características actuales

- Escena 3D con Three.js y controles orbitales para explorar la carta como un mandala interactivo.
- Cálculo astrológico simplificado completamente en el cliente (julian day, posiciones planetarias aproximadas, casas iguales, aspectos y dodecatemorias).
- Capas activables/desactivables para planetas, asteroides, centauros, puntos sensibles, aspectos, casas, etiquetas y dodecatemorias.
- Formulario para ingresar datos natales y recalcular la carta en el momento.
- Gestor de perfiles guardados en `localStorage` con posibilidad de crear, activar o eliminar cartas.
- Exportación del canvas 3D como imagen PNG.
- Interfaz responsive pensada para funcionar como base de una PWA offline.

> ⚠️ Los cálculos incluidos son aproximaciones matemáticas ligeras destinadas a pruebas visuales. Se recomienda reemplazarlos por efemérides precisas (p. ej. Swiss Ephemeris o algoritmo de Moshier) antes de usar el sistema con fines profesionales.

## Scripts

- `npm run dev` – Inicia el entorno de desarrollo de Vite.
- `npm run build` – Compila el proyecto para producción.
- `npm run preview` – Sirve la compilación generada.

## Próximos pasos sugeridos

1. Integrar una librería de efemérides precisa para cubrir todos los cuerpos solicitados con orbes exactos.
2. Añadir diferentes sistemas de casas y configuraciones avanzadas de aspectos/orbes.
3. Convertir el proyecto en PWA agregando service worker y manifiesto.
4. Incorporar interpretaciones textuales y secciones educativas.
5. Añadir pruebas automatizadas y validaciones exhaustivas.
