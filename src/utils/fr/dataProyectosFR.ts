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

export const dataProyectosFR: DataProjects[] = [
  {
    id: "backend-task",
    title: "BackendTask",
    description:
      "Backend My Task Board devchallenges.io avec CRUD complet en MySQL et PostgreSQL pour la gestion des tâches et l'obtention des statuts selon la tâche.",
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
      "Backend avec Express et Nodemon incluant CRUD, JWT, Swagger et le téléchargement de fichiers. Interface frontend en React avec Zustand et TanStack Query.",
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
      "Système de gestion des dépenses utilisant TanStack Query, Zustand, React et Styled Components pour suivre vos dépenses quotidiennes.",
    topics: [
      "Supabase/supabase-js",
      "Tanstack/react-query",
      "Firebase",
      "React",
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
      "Application CLI pour suivre les dépenses inspirée de roadmap.sh.",
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
      "Application frontend démonstrative sans backend, réalisée avec React.",
    topics: [
      "Chartjs",
      "Framer-motion",
      "Material-react-table",
      "Motion-number",
      "Query-string",
      "React-icons",
      "React-router-dom",
      "React",
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
      "Filtrage d'un inventaire via un fichier CSV pour obtenir une estimation précise du nombre d’actifs hors d’usage.",
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
      "Premier développement avec une API météo et premier portfolio réalisé en HTML, CSS et JavaScript.",
    topics: ["HTML", "CSS", "Javascript", "Scrollreveal-js", "Unicons"],
    link: "https://muke78.github.io/khelde.io/personal.html",
    img: kheldeIO.src,
    fork: false,
  },
  {
    id: "landing-page-cash-bank-con-astro",
    title: "Landing Page Cash Bank",
    description: "Landing page de Cash Bank créée avec Astro 4 et Tailwind.",
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
    title: "Portefeuille",
    description:
      "Portfolio développé avec Astro 5.4.2 et React, supportant TypeScript et Dynamic Islands, utilisant @astrojs/tailwind en version 5.1.5.",
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
      "react-hook-form",
      "react-hot-toast",
    ],
    link: "https://khelde.vercel.app/",
    img: portafolio.src,
    fork: false,
  },
  {
    id: "sistema_numerico",
    title: "Système Numérique",
    description:
      "Petite calculatrice permettant de convertir des bases numériques dans les systèmes informatiques.",
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
    title: "Task Tracker CLI",
    description:
      "Application CLI pour suivre les tâches inspirée de roadmap.sh.",
    topics: ["Cli", "Cli-app", "Fs", "Javascript", "Path", "Todolist"],
    link: "https://github.com/muke78/task-tracker-cli",
    img: taskTracker.src,
    fork: false,
  },
];
