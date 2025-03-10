import backendTask from "@/img/BackendTask.webp";
import backendREST from "@/img/Backend_RESTFULL.webp";
import heroApp from "@/img/HeroApp.webp";
import calculadoraSistemaNumerico from "@/img/calculadoraSistemaNumerico.webp";
import cashBank from "@/img/cashBank.webp";
import cerdyn from "@/img/cerdyn.webp";
import expenseTracker from "@/img/expense-tracker-cli.webp";
import inventarioKinder from "@/img/inventarioKinder.webp";
import kheldeIO from "@/img/kheldeio.webp";
import mathGame from "@/img/mathgame.webp";
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
      "backend-api",
      "crud-application",
      "expressjs",
      "mysql",
      "mysql2",
      "node",
      "nodejs",
      "postgres",
      "postgresql",
      "dotenv",
      "nodemon",
      "pg",
      "swagger-jsdoc",
      "swagger-ui-express",
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
      "@formkit/tempo",
      "@trivago/prettier-plugin-sort-imports",
      "argon2",
      "backend",
      "backend-api",
      "crud-application",
      "express",
      "jwt-authentication",
      "jwt-token",
      "mysql2",
      "node",
      "nodemon",
      "rest-api",
      "swagger-jsdoc",
      "swagger-ui-express",
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
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "chart.js",
      "dayjs",
      "emoji-picker-react",
      "firebase",
      "iso-country-currency",
      "react",
      "react-chartjs-2",
      "react-color",
      "react-content-loader",
      "react-dom",
      "react-hook-form",
      "react-icons",
      "react-lottie",
      "react-router-dom",
      "react-spinners",
      "styled-components",
      "sweetalert2",
      "swiper",
      "zustand",
    ],
    link: "https://control-gastos-b1017.web.app/login",
    img: cerdyn.src,
    fork: false,
  },
  {
    id: "expense-tracker-cli",
    title: "expense-tracker-cli",
    description: "Aplicación desde CLI para tener un registro de gastos",
    topics: [
      "chalk-cli",
      "cli",
      "commanderjs",
      "csv-export",
      "inquirer",
      "inquirer-prompt",
      "node-fs",
      "tracker-expenses",
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
      "chartjs",
      "framer-motion",
      "material-react-table",
      "motion-number",
      "query-string",
      "reac-icons",
      "reac-router-dom",
      "react",
      "vite",
    ],
    link: "https://heroappmkkh78.netlify.app/",
    img: heroApp.src,
    fork: false,
  },
  {
    id: "inventario-kinder",
    title: "Kindergarten-inventory",
    description:
      "Filtrado de un inventario por medio de un CSV para sacar una proporción precisa del número de activos que ya estás en desuso",
    topics: [
      "inventory-management",
      "jupyter-notebook",
      "matplotlib",
      "pandas",
      "python",
    ],
    link: "https://github.com/muke78/Inventario-kinder",
    img: inventarioKinder.src,
    fork: false,
  },
  {
    id: "khelde-io",
    title: "khelde.io",
    description:
      "Primer desarrollo con api de clima más primer portafolio hecho con html, css y javascript",
    topics: ["css", "html", "javascript", "scrollreveal-js", "unicons"],
    link: "https://muke78.github.io/khelde.io/personal.html",
    img: kheldeIO.src,
    fork: false,
  },
  {
    id: "landing-page-cash-bank-con-astro",
    title: "Landing-Page-Cash-Bank-con-Astro",
    description: "Landing Page de Cash Bank creada con Astro 4 y Tailwind",
    topics: [
      "@astrojs/check",
      "@astrojs/tailwind",
      "astro",
      "tailwindcss",
      "typescript",
    ],
    link: "https://cash-bank.pages.dev/",
    img: cashBank.src,
    fork: true,
  },
  {
    id: "math-game",
    title: "Mathgame",
    description: "Juego de suma de números y restas y multiplicación",
    topics: ["css", "html", "javascript", "javascript-game"],
    link: "https://mathgame-khelde.netlify.app/",
    img: mathGame.src,
    fork: false,
  },
  {
    id: "portafolio",
    title: "Portafolio",
    description:
      "Portafolio creado con astro 5.4.2 con react soporte para typescript con dynamic-islands y con la librería de @astrojs/tailwind en su versión 5.1.5",
    topics: [
      "@astrojs/check",
      "@astrojs/node",
      "@astrojs/react",
      "@astrojs/tailwind",
      "@swup/astro",
      "@trivago/prettier-plugin-sort-imports",
      "@types/react",
      "animate.css",
      "astro",
      "daisyui",
      "flowbite",
      "react",
      "react-dom",
      "swup",
      "tailwindcss",
      "prettier",
    ],
    link: "https://khelde.vercel.app/",
    img: portafolio.src,
    fork: false,
  },
  {
    id: "sistema_numerico",
    title: "Number_System",
    description:
      "Pequeña calculadora para poder pasar de una base numérica a otra, del sistema numérico informático",
    topics: [
      "binary",
      "calculator",
      "hexadecimal",
      "octal",
      "python",
      "tkinter-python",
    ],
    link: "https://github.com/muke78/Sistema_Numerico",
    img: calculadoraSistemaNumerico.src,
    fork: false,
  },
  {
    id: "task-tracker-cli",
    title: "task-tracker-cli",
    description: "Backend from CLI of a task tracker",
    topics: ["cli", "cli-app", "fs", "javascript", "path", "todolist"],
    link: "https://github.com/muke78/task-tracker-cli",
    img: taskTracker.src,
    fork: false,
  },
];
