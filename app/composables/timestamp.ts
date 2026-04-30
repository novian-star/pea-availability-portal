export function useTimestamp() {
  return useAsyncData('timestamp', async () => {
    const requestFetch = useRequestFetch();

    const { timestamp: fetchedTimestamp } = await requestFetch(
      '/api/statistics/timestamp',
    );

    return fetchedTimestamp ? new Date(fetchedTimestamp) : new Date();
  });
}
