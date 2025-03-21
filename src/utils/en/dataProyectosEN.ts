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

export const dataProyectosEN: DataProjects[] = [
  {
    id: "backend-task",
    title: "BackendTask",
    description:
      "Backend for My Task Board from devchallenges.io with full CRUD in MySQL and PostgreSQL, including task management and status retrieval based on the task",
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
      "Backend with Express and Nodemon featuring CRUD, JWT authentication, Swagger, and file uploads. Later, a React interface with Zustand and TanStack Query",
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
      "Expense tracking system built with TanStack Query, Zustand, React, and Styled Components, serving as a personal finance tracker",
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
    title: "Expense Tracker CLI",
    description:
      "CLI application for tracking expenses, inspired by roadmap.sh",
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
      "Sample application demonstrating how to build a fully functional frontend page without a backend using React",
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
      "Inventory filtering via CSV to accurately determine the proportion of unused assets",
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
      "First project using a weather API and first portfolio built with HTML, CSS, and JavaScript",
    topics: ["HTML", "CSS", "Javascript", "Scrollreveal-js", "Unicons"],
    link: "https://muke78.github.io/khelde.io/personal.html",
    img: kheldeIO.src,
    fork: false,
  },
  {
    id: "landing-page-cash-bank-con-astro",
    title: "Landing Page Cash Bank",
    description: "Cash Bank landing page built with Astro 4 and Tailwind",
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
    title: "Portfolio",
    description:
      "Portfolio created with Astro 5.4.2, React, and TypeScript, featuring dynamic islands and @astrojs/tailwind 5.1.5",
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
    title: "Number System",
    description:
      "Small calculator for converting between different number bases in computer number systems",
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
    description: "CLI application for task tracking, inspired by roadmap.sh",
    topics: ["Cli", "Cli-app", "Fs", "Javascript", "Path", "Todolist"],
    link: "https://github.com/muke78/task-tracker-cli",
    img: taskTracker.src,
    fork: false,
  },
];
