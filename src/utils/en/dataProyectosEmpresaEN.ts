import backendERP from "@/img/BackeENDPir.webp";
import frontendERP from "@/img/FRntERP.webp";
import type { DataProjects } from "@/types/typesDataproyectos";

export const dataProyectosEmpresarialesEN: DataProjects[] = [
  {
    id: "erp-obra",
    title: "Frontend ERP Obra",
    description:
      "Administration panel for control of works and tenders through an ERP",
    topics: [
      "php",
      "moment.js",
      "dropzone.js",
      "power BI",
      "chart.js",
      "datatables",
      "sweetalert2",
      "boostrap",
      "leaflet",
      "aws-sdk",
      "adminlte.js",
      "jwt-decode",
      "dotenv",
      "dotenv-webpack",
      "webpack",
      "webpack-cli",
      "webpack-dev-server",
    ],
    link: "Confidential",
    img: frontendERP.src,
    fork: false,
  },
  {
    id: "backend-obra",
    title: "Backend ERP Obra",
    description:
      "Logical part of the system for consumption from the ERP through the RESTFULL API",
    topics: [
      "async",
      "await",
      "axios",
      "bcrypt-nodejs",
      "bcryptjs",
      "body-parser",
      "dotenv",
      "express",
      "jsonwebtoken",
      "jwt-simple",
      "moment",
      "mongoose",
      "mssql",
      "nodemon",
      "socket.io",
      "swagger-jsdoc",
      "swagger-ui-express",
    ],
    link: "Confidential",
    img: backendERP.src,
    fork: false,
  },
  {
    id: "backEnd-aseguradora",
    title: "Backend Aseguradora",
    description:
      "Logic of an administrative panel for financial insurance risks",
    topics: [
      "cors",
      "dotenv",
      "bcrypt-nodejs",
      "body-parser",
      "express",
      "jsonwebtoken",
      "mysql",
      "nodemon",
    ],
    link: "Confidential",
    img: backendERP.src,
    fork: false,
  },
];
