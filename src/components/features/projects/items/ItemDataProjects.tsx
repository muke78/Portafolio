import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/interfaces/currentLang.interface";

import { useCallback, useMemo, useState } from "react";

import { Github, Globe } from "lucide-react";

export const ItemDataProjects = ({
  currentLocale,
  data,
  loading,
}: PropsLangWithData) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const i18n = getI18N({ currentLocale });

  // Detectamos si está cargando (data no existe o está vacía)
  const isLoading = loading;

  const handleImageLoad = useCallback((tech: string) => {
    setLoadedImages((prev) => ({ ...prev, [tech]: true }));
  }, []);

  return (
    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
      {isLoading ? (
        <span className="loading loading-ring loading-xl"></span>
      ) : (
        data.map(
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
                  className={`transition-transform duration-300 ease-in-out group-hover:scale-[1.03] ${
                    loadedImages[card_image]
                      ? "opacity-100"
                      : "opacity-0 absolute"
                  }`}
                  style={{
                    width: "1918px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                  onLoad={() => handleImageLoad(card_image)}
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
                      {i18n.PROJECTS.PROJECTS_BADGE_FORK}
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
                            className={`leading-6 transition-opacity duration-300 ${
                              loadedImages[topic]
                                ? "opacity-100"
                                : "opacity-0 absolute"
                            }`}
                            src={`https://go-skill-icons.vercel.app/api/icons?i=${topic}`}
                            alt={topic}
                            onLoad={() => handleImageLoad(topic)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ),
        )
      )}
    </div>
  );
};
