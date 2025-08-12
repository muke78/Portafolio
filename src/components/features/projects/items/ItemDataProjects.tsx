import type { PropsLangWithData } from "@/interfaces/currentLang.interface";

import { useMemo } from "react";

import { Github, Globe } from "lucide-react";

export const ItemDataProjects = ({
  currentLocale,
  data,
}: PropsLangWithData) => {
  const memorization = useMemo(() => data, [data]);

  // Detectamos si está cargando (data no existe o está vacía)
  const isLoading = !data || data.length === 0;

  // Para skeletons, simulamos 3 cards de carga
  const skeletonItems = Array(3).fill(null);

  // Skeleton que coincide exactamente con el diseño original
  const SkeletonCard = () => (
    <div className="card bg-base-100 shadow-sm border border-transparent animate-pulse">
      {/* Figure skeleton - mismo tamaño que las imágenes reales */}
      <figure className="relative overflow-hidden">
        <div className="w-full h-48 bg-base-300"></div>
        {/* Botones skeleton en las mismas posiciones */}
        <div className="absolute right-12 top-2 p-2">
          <div className="btn btn-sm bg-base-300 border-0">
            <div className="w-[30px] h-[30px] bg-base-content/20 rounded"></div>
          </div>
        </div>
        <div className="absolute right-0 top-2 p-2">
          <div className="btn btn-sm bg-base-300 border-0">
            <div className="w-[30px] h-[30px] bg-base-content/20 rounded"></div>
          </div>
        </div>
      </figure>

      {/* Card body skeleton */}
      <div className="card-body">
        {/* Título y badge skeleton */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 bg-base-300 rounded w-32"></div>
            <div className="badge bg-base-300 border-0 h-5 w-20"></div>
          </div>
        </div>

        {/* Descripción skeleton - 3 líneas como el contenido real */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-base-300 rounded w-full"></div>
          <div className="h-4 bg-base-300 rounded w-4/5"></div>
          <div className="h-4 bg-base-300 rounded w-3/5"></div>
        </div>

        {/* Card actions skeleton */}
        <div className="card-actions justify-start">
          <div className="avatar-group -space-x-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="avatar">
                <div className="w-8 h-8 bg-base-300 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
      {isLoading
        ? skeletonItems.map((_, i) => <SkeletonCard key={i} />)
        : memorization.map(
            ({
              project_id,
              slug,
              card_image,
              images_topics,
              link_repo,
              link_web,
              title,
              description,
              fork,
            }) => (
              <div
                className="card bg-base-100 shadow-sm border border-transparent hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-2xl hover:scale-[1.03] hover:brightness-105 transition-all duration-300 ease-in-out"
                key={project_id}
              >
                <figure className="relative overflow-hidden group cursor-pointer">
                  <img
                    src={card_image}
                    alt={slug}
                    className="transition-transform duration-300 ease-in-out group-hover:scale-[1.03]"
                    style={{
                      width: "1918px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />

                  {/* Botón GitHub */}
                  <div className="absolute right-12 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a
                      href={link_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-soft hover:btn-secondary"
                    >
                      <Github size={18} />
                    </a>
                  </div>

                  {/* Botón Live Demo */}
                  <div className="absolute right-0 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a
                      href={link_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-soft hover:btn-secondary"
                    >
                      <Globe size={18} />
                    </a>
                  </div>
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-2xl">
                    {title}
                    {fork && (
                      <div className="badge badge-secondary text-base-200 font-medium">
                        Colaboracion
                      </div>
                    )}
                  </h2>
                  <p>{description}</p>

                  <div className="card-actions justify-start">
                    <div className="avatar-group -space-x-3 py-3">
                      {images_topics.map((topic) => (
                        <div
                          className="avatar hover:-translate-y-3 transition-all duration-400"
                          key={topic}
                        >
                          <div className="w-8">
                            <img
                              src={`https://go-skill-icons.vercel.app/api/icons?i=${topic}`}
                              alt={topic}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
    </div>
  );
};
