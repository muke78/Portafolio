import React from "react";

import { getI18N } from "../../i18n";
import { useFetchRepos } from "../hooks/useRepoGithub";

interface PropsRepositorios {
  currentLocale: string;
}

export const Repositorios: React.FC<PropsRepositorios> = ({
  currentLocale,
}) => {
  const { data } = useFetchRepos();
  const i18n = getI18N({ currentLocale });

  return (
    <>
      {Array.isArray(data) && data.length > 0 ? (
        data.map((repo) => (
          <div
            key={repo.id}
            className="backdrop-blur-[19px] backdrop-saturate-[180%] border border-neutral-700 rounded-lg py-5 card shadow-md p-4 flex flex-col justify-between h-full"
          >
            <div className="flex items-center mb-2">
              <div className="avatar w-9 h-9 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  id="github"
                  className="fill-current"
                >
                  <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z" />
                </svg>
              </div>
              <h2 className="font-semibold text-xl">{repo.name}</h2>
            </div>
            <p className="text-base-content">
              {repo.description
                ? repo.description
                : "No description available."}
            </p>
            <div className="mt-4">
              {repo.topics ? (
                <div className="flex flex-wrap gap-2">
                  {repo.fork && (
                    <span className="bg-base-content text-base-100 font-semibold px-3 py-1 rounded-full">
                      PR
                    </span>
                  )}
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No topics available.</p>
              )}
            </div>
            <div className="mt-4">
              <a
                className="btn btn-neutral backdrop-blur-[19px] backdrop-saturate-[180%] border border-neutral-700 rounded-lg flex justify-center items-center"
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {i18n.PROJECTS.PROJECTS_VIEW}
              </a>
            </div>
          </div>
        ))
      ) : (
        <p>No repositories found.</p>
      )}
    </>
  );
};
