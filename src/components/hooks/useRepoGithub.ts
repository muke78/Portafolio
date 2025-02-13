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

const localCache: Record<string, Repo[]> = {};

export const useFetchRepos = (): FetchReposResponse => {
  const [repos, setRepos] = useState<FetchReposResponse>({
    data: null,
  });

  const getFetch = async () => {
    if (localCache[GITHUB_API_URL]) {
      setRepos({
        data: localCache[GITHUB_API_URL],
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

      localCache[GITHUB_API_URL] = filteredRepos;
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
