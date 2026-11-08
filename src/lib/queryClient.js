import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // ৩০ সেকেন্ড পর্যন্ত পুরনো data দেখালেই চলবে, এই সময়ে আবার fetch করবে না
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
