import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../services/api';

const DEFAULT_PARAMS = {
  search: '',
  status: 'ALL',
  source: 'ALL',
  sortBy: 'lastRun',
  sortOrder: 'desc',
  page: 1,
  pageSize: 8,
};

// Custom hook: owns pipeline-list fetching (search, filter, sort, pagination)
// with loading / error / empty state handling and request cancellation.
export function usePipelines() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const updateParams = useCallback((patch) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  useEffect(() => {
    const current = ++requestId.current;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getPipelines(params)
      .then((res) => {
        if (!cancelled && current === requestId.current) {
          setData(res.data);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled && current === requestId.current) {
          setError(err?.response?.data?.detail || err.message || 'Failed to load pipelines.');
          setData([]);
          setTotal(0);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.search, params.status, params.source, params.sortBy, params.sortOrder, params.page, params.pageSize]);

  const setPage = useCallback((page) => updateParams({ page }), [updateParams]);
  const setSort = useCallback(
    (sortBy) => {
      setParams((prev) => ({
        ...prev,
        sortBy,
        sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
        page: 1,
      }));
    },
    []
  );

  return useMemo(
    () => ({
      pipelines: data,
      total,
      loading,
      error,
      params,
      updateParams,
      resetFilters,
      setPage,
      setSort,
      reload: () => setParams((prev) => ({ ...prev })),
    }),
    [data, total, loading, error, params, updateParams, resetFilters, setPage, setSort]
  );
}
