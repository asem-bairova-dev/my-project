import { BlockKey, BriefInput, SearchResult } from "./types";
import { buildQueries } from "./search-queries";
import { mockSearch } from "./mock-search";

export const isSearchLive = () => Boolean(process.env.TAVILY_API_KEY);

async function tavilySearch(query: string): Promise<SearchResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: 3,
      search_depth: "basic",
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily search failed (${res.status}) for query: ${query}`);
  }

  const data = await res.json();
  type TavilyItem = { title?: string; url?: string; content?: string };
  const results: TavilyItem[] = data.results ?? [];

  return results.map((r) => ({
    query,
    title: r.title ?? "",
    url: r.url ?? "",
    content: r.content ?? "",
  }));
}

export async function runSearch(
  input: BriefInput
): Promise<Record<BlockKey, SearchResult[]>> {
  const queriesByBlock = buildQueries(input);

  if (!isSearchLive()) {
    return mockSearch(input, queriesByBlock);
  }

  const entries = await Promise.all(
    (Object.keys(queriesByBlock) as BlockKey[]).map(async (block) => {
      const results = await Promise.all(
        queriesByBlock[block].map((q) =>
          tavilySearch(q).catch((): SearchResult[] => [])
        )
      );
      return [block, results.flat()] as const;
    })
  );

  return Object.fromEntries(entries) as Record<BlockKey, SearchResult[]>;
}
