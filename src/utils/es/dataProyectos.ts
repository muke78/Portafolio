import backendTask from "@/img/BackendTask.webp";
import backendREST from "@/img/Backend_RESTFULL.webp";
import heroApp from "@/img/HeroApp.webp";
import calculadoraSistemaNumerico from "@/img/calculadoraSistemaNumerico.webp";
import cashBank from "@/img/cashBank.webp";
import cerdyn from "@/img/cerdyn.webp";
import expenseTracker from "@/img/expense-tracker-cli.webp";
import inventarioKinder from "@/img/inventarioKinder.webp";
import kheldeIO from "@/img/kheldeio.webp";
import portafolio from "@/img/portafolio.webp";
import taskTracker from "@/img/taskTracker.webp";
import type { DataProjects } from "@/types/typesDataproyectos";

export const dataProyectos: DataProjects[] = [
  {
    id: "backend-task",
    title: "BackendTask",
    description:
      "Backend My Task Board devchallenges.io con CRUD en mysql y postgresql completo de tareas y obtención de estados según la tarea",
    topics: [
      "Backend-api",
      "Crud-application",
      "Expressjs",
      "Mysql",
      "Nodejs",
      "Postgresql",
      "Swagger",
    ],
    link: "https://github.com/muke78/BackendTask",
    img: backendTask.src,
    fork: false,
  },
  {
    id: "backend-rest-full",
    title: "Backend_RESTFULL",
    description:
      "Backend con Express y Nodemon con CRUD y JWT y Swagger con carga de archivos, posteriormente interfaz en react con zustand y tanstack_query",
    topics: [
      "Trivago/prettier-plugin-sort-imports",
      "Express",
      "Jwt-authentication",
      "Jwt-token",
      "Expressjs",
      "Mysql",
      "Nodejs",
      "Swagger",
    ],
    link: "https://github.com/muke78/Backend_RESTFULL",
    img: backendREST.src,
    fork: false,
  },
  {
    id: "cerdyn-os",
    title: "CerdynOS",
    description:
      "Sistema de control de gastos hecho con Tanstack Query, Zustand, React, Styled Components, como cartera de los gastos que llevas día a día",
    topics: [
      "Supabase/supabase-js",
      "Tanstack/react-query",
      "Firebase",
      "Eeact",
      "React-chartjs-2",
      "Styled-components",
      "Sweetalert2",
      "Swiper",
      "Zustand",
    ],
    link: "https://control-gastos-b1017.web.app/login",
    img: cerdyn.src,
    fork: false,
  },
  {
    id: "expense-tracker-cli",
    title: "Expense Tracker Cli",
    description:
      "Aplicación desde CLI para tener un registro de gastos de roadmap.sh",
    topics: [
      "Chalk-cli",
      "Cli",
      "Commanderjs",
      "Csv-export",
      "Inquirer",
      "Inquirer-prompt",
      "Node-fs",
      "Tracker-expenses",
    ],
    link: "https://github.com/muke78/expense-tracker-cli",
    img: expenseTracker.src,
    fork: false,
  },
  {
    id: "hero-app",
    title: "HeroApp",
    description:
      "Aplicación muestra de cómo hacer una página funcional frontend sin backend ocupando react",
    topics: [
      "Chartjs",
      "Framer-motion",
      "Material-react-table",
      "Motion-number",
      "Query-string",
      "Reac-icons",
      "Reac-router-dom",
      "Eeact",
      "Vite",
    ],
    link: "https://heroappmkkh78.netlify.app/",
    img: heroApp.src,
    fork: false,
  },
  {
    id: "inventario-kinder",
    title: "Kindergarten Inventory",
    description:
      "Filtrado de un inventario por medio de un CSV para sacar una proporción precisa del número de activos que ya estás en desuso",
    topics: [
      "Inventory-management",
      "Jupyter-notebook",
      "Matplotlib",
      "Pandas",
      "Python",
    ],
    link: "https://github.com/muke78/Inventario-kinder",
    img: inventarioKinder.src,
    fork: false,
  },
  {
    id: "Khelde-io",
    title: "Khelde.io",
    description:
      "Primer desarrollo con api de clima más primer portafolio hecho con html, css y javascript",
    topics: ["HTML", "CSS", "Javascript", "Scrollreveal-js", "Unicons"],
    link: "https://muke78.github.io/khelde.io/personal.html",
    img: kheldeIO.src,
    fork: false,
  },
  {
    id: "landing-page-cash-bank-con-astro",
    title: "Landing Page Cash Bank",
    description: "Landing Page de Cash Bank creada con Astro 4 y Tailwind",
    topics: [
      "@astrojs/check",
      "@astrojs/tailwind",
      "Astro",
      "Tailwindcss",
      "Typescript",
    ],
    link: "https://cash-bank.pages.dev/",
    img: cashBank.src,
    fork: true,
  },
  {
    id: "portafolio",
    title: "Portafolio",
    description:
      "Portafolio creado con astro 5.4.2 con react soporte para typescript con dynamic-islands y con la librería de @astrojs/tailwind en su versión 5.1.5",
    topics: [
      "Trivago/prettier-plugin-sort-imports",
      "Animate.css",
      "Astro",
      "Daisyui",
      "Flowbite",
      "React",
      "Typescript",
      "React-dom",
      "Swup",
      "Tailwindcss",
      "Prettier",
    ],
    link: "https://khelde.vercel.app/",
    img: portafolio.src,
    fork: false,
  },
  {
    id: "sistema_numerico",
    title: "Number System",
    description:
      "Pequeña calculadora para poder pasar de una base numérica a otra, del sistema numérico informático",
    topics: [
      "Binary",
      "Calculator",
      "Hexadecimal",
      "Octal",
      "Python",
      "Tkinter-python",
    ],
    link: "https://github.com/muke78/Sistema_Numerico",
    img: calculadoraSistemaNumerico.src,
    fork: false,
  },
  {
    id: "task-tracker-cli",
    title: "Task Tracker Cli",
    description:
      "Aplicación desde CLI para tener un registro de tareas de roadmap.sh",
    topics: ["Cli", "Cli-app", "Fs", "Javascript", "Path", "Todolist"],
    link: "https://github.com/muke78/task-tracker-cli",
    img: taskTracker.src,
    fork: false,
  },
];
