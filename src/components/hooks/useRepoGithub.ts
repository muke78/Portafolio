import { useEffect, useState } from "react";

import { reposDeseados } from "../../utils/dataRepoPinned";

const GITHUB_API_URL = "https://api.github.com/users/muke78/repos";

interface Repo {
  id: number;
  name: string;
  description: string;
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
    } catch (error) {
      console.error("Error fetching repos:", error);
      setRepos({
        data: null,
      });
    }
  };

  useEffect(() => {
    getFetch();
  }, [GITHUB_API_URL]);

  return {
    data: repos.data,
  };
};
