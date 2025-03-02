# Portafolio desarrollado en astro

Se realizo el porttafolio con la tecnoligia de [Astro](https://astro.build/) y con la libreria de [React](https://es.react.dev/) montada a astro, con [Tailwind](https://tailwindui.com/) 5.1.5 en su interfaz desde @astrojs/tailwind
con tailwindcss 3.4.17

- Se monto [Daisyui](https://daisyui.com/) sobre tailwind para manejar los temas de la apliacion
- Se monto [Flowbite](https://flowbite.com/) sobre tailwind para darle funcionalidad a los componentes y ahorrar lineas de javascript
- Version estable `v.1.3.2` release, proximas y futuras actualizaciones
- Proxima actualizacion `v.1.4.2`
- Se ocupa la herramienta de reenvio de puertos desde host de tunel para revisar los cambios de el servidor en tiempo real desde un celular

# Estructura del proyecto

Se hizo el cambio a arquitectura por funcionalidad para llevar un mejor cambio de los archivos y este mas organizado, un ejemplo como este

```txt
src/
|-- components/
|	 |- atoms/
|  |  |-- Button/
|	 |  |   |-- Button.jsx
|	 |  |   |-- Button.test.js
|  |- molecules
|  |- organisms
|  |- templates
|-- contexts/
|   |-- UserContext/
|   |   |-- UserContext.js
|-- hooks/
|   |-- useMediaQuery/
|   |   |-- useMediaQuery.js
|-- features/
|   |-- Home/
|   |   |-- atoms/
|   |   |-- molecules/
|   |   |-- organisms/
|   |   |-- utils/
|   |   |-- services/
|   |   |-- hooks/
|   |   |-- contexts/
|   |   |-- pages/
|   |   |   |-- HomePage.jsx
|   |-- index.js
|-- utils/
|   |-- some-common-util/
|   |   |-- index.js/
|   |   |-- index.test.js
|-- services/
|   |-- some-common-service/
|   |   |-- index.js/
|   |   |-- some-common-service.js/
|   |   |-- index.test.js
|-- App.jsx
|-- index.js
```
