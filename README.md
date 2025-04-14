# Portafolio desarrollado en astro

Se realizo el porttafolio con la tecnoligia de [Astro](https://astro.build/) y con la libreria de [React](https://es.react.dev/) montada a astro, con [Tailwind](https://tailwindui.com/) en su interfaz desde @tailwindcss/vite
con tailwindcss 4.1.3

- Se monto [Daisyui](https://daisyui.com/) sobre tailwind para manejar los temas de la apliacion 5.0.6
- Version estable `v.2.1.1` release, proximas y futuras actualizaciones
- Proxima actualizacion `v.2.2.2`
- Se ocupa la herramienta de reenvio de puertos desde host de tunel para revisar los cambios de el servidor en tiempo real desde un celular

## 🛠 Tecnologías Utilizadas

El proyecto está desarrollado con las siguientes tecnologías y librerías:

### 📌 **Frontend y UI**

- [`astro`](https://astro.build/) - Framework moderno para crear sitios rápidos y estáticos con componentes de múltiples frameworks.
- [`react-dom`](https://react.dev/) - Renderizado de componentes React en el DOM.
- [`react-router-dom`](https://reactrouter.com/) - Enrutamiento dinámico en aplicaciones React.
- [`tailwindcss`](https://tailwindcss.com/) - Framework CSS para estilos rápidos y eficientes.
- [`daisyui`](https://daisyui.com/) - Extensión de TailwindCSS con componentes personalizables.
- [`framer-motion`](https://www.framer.com/motion/) - Animaciones fluidas y avanzadas en React.
- [`animate.css`](https://animate.style/) - Animaciones CSS listas para usar.
- [`swup`](https://swup.dev/) - Transiciones suaves entre páginas para mejorar la experiencia del usuario.
- [`swiper`](https://swiperjs.com/) - Slider moderno y responsivo con soporte para gestos táctiles.
- [`react-hot-toast`](https://react-hot-toast.com/) - Notificaciones livianas y personalizables en React.
- [`react-hook-form`](https://react-hook-form.com/) - Manejador de formularios para React eficiente y flexible.
- [`husky`](https://typicode.github.io/husky/#/) - Herramienta para ejecutar hooks de Git como validaciones antes de commits.

## 📂 Estructura del Proyecto

Se hizo el cambio a arquitectura por funcionalidad para llevar un mejor cambio de los archivos y este mas organizado, un ejemplo como este

```
/src
├── /components               # Componentes reutilizables de UI
│   ├── /atoms                # Elementos básicos de la UI (botones, inputs, etc.)
│   ├── /features             # Componentes enfocados en funcionalidades específicas
│   ├── /organisms            # Composición de múltiples componentes (más complejos)
│   ├── /templates            # Estructuras de diseño reutilizables
│   └── /utils                # Utilidades específicas para componentes
├── /hooks                    # Custom hooks reutilizables
├── /i18n                     # Configuración de internacionalización
│   ├── /locales              # Archivos de traducción por idioma
│   ├── index.ts              # Archivo principal de i18n
│   ├── ui.ts                 # Traducciones de elementos de UI
│   └── utils.ts              # Funciones auxiliares para i18n
├── /img                      # Recursos gráficos e imágenes
├── /js                       # Scripts JS que no pertenecen a componentes
├── /layouts                  # Plantillas de diseño general de páginas
├── /pages                    # Rutas y páginas del sitio
│   ├── /en                   # Páginas en inglés
│   ├── /es                   # Páginas en español
│   ├── /fr                   # Páginas en francés
│   ├── 404.astro             # Página de error personalizada
│   └── index.astro           # Página principal
├── /styles                   # Archivos de estilos globales
├── /types                    # Definiciones de tipos TypeScript
└── /utils                    # Funciones y datos reutilizables globales
    ├── /en                   # Datos en inglés
    ├── /es                   # Datos en español
    ├── /fr                   # Datos en francés
    ├── dataDarkThemes.ts     # Configuración de temas oscuros
    ├── dataRepoPinned.ts     # Repositorios destacados
    └── dataTitlePage.ts      # Títulos y metadatos de las páginas
```

## 📌 Convenciones de Código

Para mantener un código limpio y estandarizado, seguimos estas prácticas:

- Prettier para formateo automático.
- Husky para ejecutar validaciones antes de los commits.
- Zustand para manejo de estado global.
- Astro para el framework de componentes.
- TailwindCSS para darle estilo a la aplicación.
- React para el framework de componentes.
- React Router para el enrutamiento.
- React Hook Form para el manejo de formularios.
- Framer Motion para las animaciones.
- Swiper para el slider.
- React Hot Toast para las notificaciones.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
