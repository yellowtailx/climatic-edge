// src/pages/NewsWidget.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
}

const PAGE_SIZE = 9;
const INITIAL_PAGES = 3;

const NewsWidget = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const initializedRef = useRef<boolean>(false);

  const fetchPage = useCallback(async (startOffset: number, append: boolean): Promise<boolean | null> => {
    const url = `https://api.spaceflightnewsapi.net/v4/articles/?limit=${PAGE_SIZE}&offset=${startOffset}&ordering=-published_at`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch news articles.');
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        throw new Error('News API returned an unexpected response.');
      }
      const articles: NewsArticle[] = data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.summary,
        url: item.url,
        imageUrl: item.image_url ?? null,
      }));

      setNews((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        const fresh = articles.filter((a) => !seen.has(a.id));
        return append ? [...prev, ...fresh] : [...fresh];
      });
      const more = data.next != null && articles.length > 0;
      setHasMore(more);
      setError(null);
      return more;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news.');
      return null;
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const loadDefaultPages = async () => {
      let start = 0;
      for (let page = 0; page < INITIAL_PAGES; page++) {
        const more = await fetchPage(start, page > 0);
        if (more !== true) return;
        start += PAGE_SIZE;
        setOffset(start);
      }
    };

    loadDefaultPages();
  }, [fetchPage]);

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    setLoadingMore(true);
    fetchPage(nextOffset, true);
  };

  return (
    <div className="bg-blue-100 p-4 rounded shadow">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading &&
          news.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between border border-gray-200 bg-white p-4 rounded-lg shadow-md h-80"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-32 w-full object-cover rounded mb-2"
                />
              ) : (
                <div className="h-32 w-full bg-blue-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-blue-700 font-semibold">ClimaticEdge News</span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-blue-700 truncate mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                  {item.description || 'No description available.'}
                </p>
              </div>
              <div className="mt-auto">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition-all"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
      </div>

      {!loading && !error && hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-blue-500 text-white px-6 py-2 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load more news'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsWidget;
