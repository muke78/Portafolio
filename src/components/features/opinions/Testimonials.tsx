import { animate, motion } from "framer-motion";
import { Quote } from "lucide-react";

interface PropsLang {
  currentLocale: string;
}

const testimonials = [
  {
    id: 1,
    name: "Laura Méndez",
    course: "Desarrollo Web con React",
    text: "Erick tiene una forma increíble de explicar conceptos complejos. Su claridad y paciencia me ayudaron a entender React de verdad.",
    direction: "left",
  },
  {
    id: 2,
    name: "Carlos Hernández",
    course: "Backend con Node.js y Express",
    text: "Lo que más destaco de Erick es su compromiso. Siempre estuvo disponible para resolver dudas y dar ejemplos claros.",
    direction: "bottom",
  },
  {
    id: 3,
    name: "Mariana Gutiérrez",
    course: "Full Stack Developer Bootcamp",
    text: "La forma en la que Erick estructura los cursos es excelente. Cada módulo tiene propósito, no hay relleno.",
    direction: "left",
  },
  {
    id: 4,
    name: "José Antonio Ruiz",
    course: "Bases de datos relacionales",
    text: "Gracias a Erick aprendí a normalizar y estructurar correctamente mis bases de datos. Explica con claridad y ejemplos prácticos.",
    direction: "bottom",
  },
  {
    id: 5,
    name: "Fernanda Castro",
    course: "Curso Profesional de JavaScript",
    text: "Sabe cómo mantener la motivación en alto. Cada clase me dejaba con ganas de seguir aprendiendo.",
    direction: "left",
  },
  {
    id: 6,
    name: "Miguel Torres",
    course: "Next.js desde cero",
    text: "Su enfoque a detalle me ayudó a entender SSR e ISR. Gran curso, gran instructor.",
    direction: "bottom",
  },
  {
    id: 7,
    name: "Patricia Vega",
    course: "DevOps para principiantes",
    text: "Erick tiene un enfoque muy profesional. No solo enseña tecnología, sino también buenas prácticas.",
    direction: "left",
  },
  {
    id: 8,
    name: "Luis Fernando Ávila",
    course: "React Avanzado + Redux",
    text: "Excelente curso, Erick transmite seguridad en lo que enseña y hace que conceptos difíciles se entiendan fácil.",
    direction: "bottom",
  },
  {
    id: 9,
    name: "Daniela Robles",
    course: "UI/UX para desarrolladores",
    text: "Me encantó cómo mezcla la teoría con ejercicios prácticos. Súper recomendable.",
    direction: "left",
  },
  // {
  //   id: 10,
  //   name: "Andrés Cortés",
  //   course: "Introducción a TypeScript",
  //   text: "Gracias a Erick ya no le tengo miedo a TypeScript. Explicaciones simples y al grano.",
  //   direction: "bottom",
  // },
  // {
  //   id: 11,
  //   name: "Valeria Pineda",
  //   course: "Desarrollo de APIs RESTful",
  //   text: "Me gustó mucho cómo va paso a paso, sin saltarse nada. Ideal para quien empieza desde cero.",
  //   direction: "left",
  // },
  // {
  //   id: 12,
  //   name: "Oscar Martínez",
  //   course: "MongoDB y Mongoose",
  //   text: "Explica de forma clara, sin rodeos. Aprendí más en una semana que en todo un semestre.",
  //   direction: "bottom",
  // },
  // {
  //   id: 13,
  //   name: "Sofía Navarro",
  //   course: "Docker y despliegue de apps",
  //   text: "El nivel de detalle que maneja es increíble. Aprendí a contenerizar mis proyectos sin miedo.",
  //   direction: "left",
  // },
  // {
  //   id: 14,
  //   name: "Diego Fuentes",
  //   course: "Curso de Vue.js moderno",
  //   text: "No sabía nada de Vue y ahora ya puedo crear apps completas. Todo gracias a su forma de enseñar.",
  //   direction: "bottom",
  // },
  // {
  //   id: 15,
  //   name: "Elena Gómez",
  //   course: "HTML, CSS y Responsive Design",
  //   text: "Me gustó cómo prioriza accesibilidad y buenas prácticas desde el inicio. Muy profesional.",
  //   direction: "left",
  // },
  // {
  //   id: 16,
  //   name: "Javier Sánchez",
  //   course: "Fundamentos de programación",
  //   text: "Un curso perfecto para quienes recién comienzan. Erick tiene mucha paciencia.",
  //   direction: "bottom",
  // },
  // {
  //   id: 17,
  //   name: "Camila Ramos",
  //   course: "MERN Stack completo",
  //   text: "Aprendí a integrar Mongo, Express, React y Node de forma sencilla. ¡Erick lo explica todo!",
  //   direction: "left",
  // },
  // {
  //   id: 18,
  //   name: "Emilio Vargas",
  //   course: "Estructuras de Datos en JavaScript",
  //   text: "Su pasión por enseñar se nota. Hace que los temas técnicos se vuelvan interesantes.",
  //   direction: "bottom",
  // },
  // {
  //   id: 19,
  //   name: "Lucía Peña",
  //   course: "Curso práctico de Git y GitHub",
  //   text: "Gracias a Erick ahora entiendo ramas, commits y PRs. ¡Por fin!",
  //   direction: "left",
  // },
  // {
  //   id: 20,
  //   name: "Rafael Díaz",
  //   course: "Introducción a la arquitectura de software",
  //   text: "Tiene una forma clara y concisa de explicar conceptos complejos como SOLID y patrones.",
  //   direction: "bottom",
  // },
  // {
  //   id: 21,
  //   name: "Ana Sofía Cruz",
  //   course: "Testing con Jest",
  //   text: "¡Gracias Erick! Ahora ya sé cómo hacer testing a mis apps sin morir en el intento.",
  //   direction: "left",
  // },
  // {
  //   id: 22,
  //   name: "Ricardo Lozano",
  //   course: "NestJS con MongoDB",
  //   text: "Lo mejor del curso es cómo relaciona teoría con código real. Muy útil para el trabajo.",
  //   direction: "bottom",
  // },
  // {
  //   id: 23,
  //   name: "Isabel Molina",
  //   course: "Curso de seguridad en aplicaciones web",
  //   text: "Me encantó cómo abordó temas como JWT y autenticación con claridad y profundidad.",
  //   direction: "left",
  // },
  // {
  //   id: 24,
  //   name: "Esteban Morales",
  //   course: "Animaciones con Framer Motion",
  //   text: "¡Brutal! Me abrió todo un mundo nuevo de animaciones en React.",
  //   direction: "bottom",
  // },
  // {
  //   id: 25,
  //   name: "Paola Díaz",
  //   course: "Curso de Clean Code",
  //   text: "Erick me hizo cambiar completamente la forma en que escribo código. Ahora todo es más legible.",
  //   direction: "left",
  // },
  // {
  //   id: 26,
  //   name: "Cristian Ríos",
  //   course: "Automatización con GitHub Actions",
  //   text: "Curso práctico, claro y bien estructurado. Aprendí CI/CD sin complicaciones.",
  //   direction: "bottom",
  // },
  // {
  //   id: 27,
  //   name: "Gabriela León",
  //   course: "Introducción a Firebase",
  //   text: "Explicaciones claras, sin rodeos. Ahora ya tengo mi app conectada en la nube.",
  //   direction: "left",
  // },
  // {
  //   id: 28,
  //   name: "Samuel Delgado",
  //   course: "React Native CLI",
  //   text: "Gran curso para quienes quieren apps nativas sin Expo. Erick es muy claro en cada paso.",
  //   direction: "bottom",
  // },
  // {
  //   id: 29,
  //   name: "Valentina Bravo",
  //   course: "Curso práctico de Tailwind CSS",
  //   text: "Todo lo que sé de Tailwind lo aprendí con Erick. ¡Explica con ejemplos reales!",
  //   direction: "left",
  // },
  // {
  //   id: 30,
  //   name: "Tomás Aguilar",
  //   course: "E-commerce con React y Stripe",
  //   text: "No solo se aprende a programar, también a pensar como desarrollador profesional.",
  //   direction: "bottom",
  // },
  // {
  //   id: 31,
  //   name: "Natalia Rosales",
  //   course: "Curso intensivo de Vue 3",
  //   text: "Gran contenido y ritmo perfecto para aprender sin perderse. Muy buen instructor.",
  //   direction: "left",
  // },
  // {
  //   id: 32,
  //   name: "Iván Correa",
  //   course: "Express + Sequelize + PostgreSQL",
  //   text: "Aprendí a crear una API robusta en muy poco tiempo. Muy agradecido con Erick.",
  //   direction: "bottom",
  // },
  // {
  //   id: 33,
  //   name: "Lucero Hernández",
  //   course: "Curso de GraphQL",
  //   text: "Gracias a este curso pude integrar GraphQL en un proyecto real de mi trabajo. Súper útil.",
  //   direction: "left",
  // },
  // {
  //   id: 34,
  //   name: "Ángel Mejía",
  //   course: "React + Firebase Auth",
  //   text: "Explicaciones al punto, sin perder tiempo. Se nota la experiencia de Erick.",
  //   direction: "bottom",
  // },
  // {
  //   id: 35,
  //   name: "Fátima Romero",
  //   course: "Microservicios con Node.js",
  //   text: "Lo más valioso es cómo explica la teoría detrás antes de escribir una sola línea de código.",
  //   direction: "left",
  // },
  // {
  //   id: 36,
  //   name: "Joaquín Beltrán",
  //   course: "SSR con Next.js",
  //   text: "Todo lo que necesitaba para profesionalizar mis proyectos. ¡Muy recomendado!",
  //   direction: "bottom",
  // },
  // {
  //   id: 37,
  //   name: "Tamara Ruiz",
  //   course: "Fundamentos de CSS moderno",
  //   text: "Erick logra que algo tan abstracto como el CSS se vuelva divertido y fácil de aplicar.",
  //   direction: "left",
  // },
  // {
  //   id: 38,
  //   name: "Kevin Olmos",
  //   course: "Automatización de tareas con Node",
  //   text: "Aprendí a crear scripts útiles que ahora uso a diario. Gracias Erick.",
  //   direction: "bottom",
  // },
  // {
  //   id: 39,
  //   name: "Brenda Zúñiga",
  //   course: "Curso de API REST y autenticación",
  //   text: "Muy profesional en todo. Cada lección bien explicada, sin nada al azar.",
  //   direction: "left",
  // },
  // {
  //   id: 40,
  //   name: "Julio César Ibarra",
  //   course: "JavaScript moderno y buenas prácticas",
  //   text: "Erick no solo enseña a codificar, sino también a pensar como desarrollador profesional.",
  //   direction: "bottom",
  // },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
    },
  },
};

const cardVariants = {
  left: {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  bottom: {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
};

export const Testimonials = ({ currentLocale }: PropsLang) => {
  return (
    <div className="relative max-w-full overflow-hidden lg:p-9 md:p-8 p-4">
      <motion.div
        className="flex flex-col text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-block px-4 py-2 bg-primary/30 text-primary text-sm font-medium rounded-full mb-4 mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Ten mucha paciencia contigo mismo y no te compares demasiado con los
          demás.
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Opiniones sobre mi trabajo
        </h2>
        <p className="text-xl text-base-content/50 font-medium">
          ¡Aquí unos comentarios!
        </p>
      </motion.div>

      <motion.div
        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={
              cardVariants[testimonial.direction as keyof typeof cardVariants]
            }
            whileHover={{
              y: -10,
              transition: { duration: 0.4 },
            }}
            className="group relative break-inside-avoid bg-base-100 rounded-lg shadow-lg hover:bg-gradient-to-br from-secondary/50 via-secondary/10 to-transparent opacity-0 hover:shadow-xl transition-all duration-300 p-6 mb-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <Quote className="w-10 h-10 text-secondary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{testimonial.name}</h3>
                <p className="text-sm font-medium">{testimonial.course}</p>
              </div>
            </div>

            <p className="text-base-content/50 leading-relaxed flex-1">
              {testimonial.text}
            </p>

            {/* Border animado desde el centro */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
