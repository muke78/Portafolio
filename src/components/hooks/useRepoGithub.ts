import { reposDeseados } from "@/utils/dataRepoPinned";
import { useEffect, useState } from "react";

const GITHUB_API_URL = "https://api.github.com/users/muke78/repos?per_page=60";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  topics: string[];
  fork: boolean;
  html_url: string;
}

interface FetchReposResponse {
  data: Repo[] | null;
}

export const useFetchRepos = (): FetchReposResponse => {
  const [repos, setRepos] = useState<FetchReposResponse>({
    data: null,
  });

  const getFetch = async () => {
    // Verificar si los datos están en el localStorage
    const cachedRepos = localStorage.getItem(GITHUB_API_URL);
    if (cachedRepos) {
      setRepos({
        data: JSON.parse(cachedRepos),
      });
      return;
    }

    try {
      const response = await fetch(GITHUB_API_URL);

      if (!response.ok) {
        setRepos({
          data: null,
        });
        return;
      }

      const reposData: Repo[] = await response.json();
      const filteredRepos = reposData.filter((repo) =>
        reposDeseados.includes(repo.name),
      );

      setRepos({
        data: filteredRepos,
      });

      // Guardar los datos en el localStorage
      localStorage.setItem(GITHUB_API_URL, JSON.stringify(filteredRepos));
    } catch (error) {
      console.error("Error fetching repos:", error);
      setRepos({
        data: null,
      });
    }
  };

  useEffect(() => {
    getFetch();
  }, []);

  return {
    data: repos.data,
  };
};