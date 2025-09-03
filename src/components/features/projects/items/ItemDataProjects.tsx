import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/interfaces/currentLang.interface";

import { useCallback, useMemo, useState } from "react";

import { Github, Globe } from "lucide-react";

export const ItemDataProjects = ({
  currentLocale,
  data,
}: PropsLangWithData) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const i18n = getI18N({ currentLocale });

  const handleImageLoad = useCallback((tech: string) => {
    setLoadedImages((prev) => ({ ...prev, [tech]: true }));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(
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
            className="card bg-base-100 shadow-sm border border-transparent 
            hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent 
            hover:shadow-2xl hover:scale-[1.03] hover:brightness-105 transition-all duration-500 ease-in-out "
            key={project_id}
          >
            <figure className="relative overflow-hidden group cursor-pointer">
              <img
                src={`https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev/${card_image}`}
                alt={slug}
                className={`transition-transform duration-300 ease-in-out group-hover:scale-[1.03] ${
                  loadedImages[card_image]
                    ? "opacity-100"
                    : "opacity-0 absolute"
                }`}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
                loading="lazy"
                onLoad={() => handleImageLoad(card_image)}
              />

              {/* Botón GitHub */}
              <div className="absolute right-12 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => window.open(link_repo, "_blank")}
                  rel="noopener noreferrer"
                  className={`btn btn-sm btn-soft ${
                    !link_repo ? "btn-disabled" : "hover:btn-secondary"
                  }`}
                  aria-label={slug}
                >
                  <Github size={18} />
                </button>
              </div>

              {/* Botón Live Demo */}
              <div className="absolute right-0 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => window.open(link_web, "_blank")}
                  rel="noopener noreferrer"
                  className={`btn btn-sm btn-soft ${
                    !link_web ? "btn-disabled" : "hover:btn-secondary"
                  }`}
                  aria-label={slug}
                >
                  <Globe size={18} />
                </button>
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
                <div className="avatar-group -space-x-2 py-3">
                  {images_topics.map((topic) => (
                    <div
                      className="avatar border-2 hover:-translate-y-3 transition-all duration-500 ease-in-out"
                      key={topic}
                    >
                      <div className="w-9">
                        <img
                          className={`leading-6 transition-opacity duration-500 ease-in-out ${
                            loadedImages[topic]
                              ? "opacity-100"
                              : "opacity-0 absolute"
                          }`}
                          src={`https://go-skill-icons.vercel.app/api/icons?i=${topic}`}
                          alt={topic}
                          onLoad={() => handleImageLoad(topic)}
                          loading="lazy"
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
