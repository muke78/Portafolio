import type {
  Experiences,
  PropsLang,
} from "@/interfaces/currentLang.interface";

import { useEffect, useState } from "react";

import { Building, Clock, MapPin } from "lucide-react";

export const ItemDataExperiencia = ({ currentLocale }: PropsLang) => {
  const [data, setData] = useState<Experiences[]>([]); // tipa tu array según tu DTO
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await fetch(
          `/api/experiences?currentLocale=${currentLocale}`,
        );
        const experiences = await result.json();
        setData(experiences.data);
      } catch (error) {
        console.error("Error cargando experiencias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentLocale]);

  if (loading) return <span className="loading loading-ring loading-xl"></span>;

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
      {data.map(
        ({
          experience_id,
          work,
          title,
          description,
          img,
          alt,
          time,
          location,
        }) => (
          <div
            key={experience_id}
            className="card bg-base-100 shadow-md border border-transparent hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent 
            hover:shadow-xl hover:scale-[1.03] hover:brightness-105 transition-all duration-500 ease-in-out  p-8 rounded-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev/${img}`}
                alt={alt}
                className="w-12 h-12 rounded-full bg-base-200 object-cover"
                loading="lazy"
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-base-content">
                  {title}
                </h2>
                {work && (
                  <span className="badge badge-primary text-base-200 font-medium textarea-md my-2 rounded-full">
                    {work}
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm space-y-2 text-base-content/80">
              <div className="flex items-center gap-2">
                <Building className="text-base-content/60" />
                <span>{description}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-base-content/60" />
                <span>{time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="text-base-content/60" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
};
