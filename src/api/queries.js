import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";

// Query key convention: ["resource", ...params] — একই key হলে React Query
// নিজে থেকেই cache শেয়ার করে, আলাদা পেজ থেকে একই data চাইলেও দ্বিতীয়বার
// network call লাগে না (staleTime শেষ না হওয়া পর্যন্ত)।
export const qk = {
  myBatches: ["batches", "my"],
  teacherBatches: ["batches", "teacher"],
  posts: (batchId) => ["posts", batchId],
  messages: (batchId) => ["messages", batchId],
  replies: (batchId, messageId) => ["messages", batchId, messageId, "replies"],
  presence: (batchId) => ["presence", batchId],
};

export function useMyBatches() {
  return useQuery({
    queryKey: qk.myBatches,
    queryFn: () => client.get("/api/batches/my/").then((r) => r.data.results),
  });
}

export function useTeacherBatches() {
  return useQuery({
    queryKey: qk.teacherBatches,
    queryFn: () => client.get("/api/batches/").then((r) => r.data.results),
  });
}

/** Batch-detail পেজগুলোর (Room/Attendance/Results/Routine/Fee) জন্য একটাই shared hook —
 * এরা সবাই একই batch list cache ব্যবহার করে, তাই batch-এর subnav tab বদলালে
 * (যেমন Room → উপস্থিতি → ফলাফল) দ্বিতীয়বার থেকে আর loading দেখায় না।
 */
export function useBatch(id, isTeacher) {
  const teacherBatches = useTeacherBatches();
  const myBatches = useMyBatches();

  if (isTeacher) {
    const data = teacherBatches.data?.find((b) => b.id === id) ?? null;
    return { data, isLoading: teacherBatches.isLoading };
  }
  const data = myBatches.data?.find((b) => b.id === id) ?? null;
  return { data, isLoading: myBatches.isLoading };
}

export function useToggleArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }) => client.patch(`/api/batches/${id}/`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.teacherBatches }),
  });
}

export function usePosts(batchId, type) {
  return useQuery({
    queryKey: type ? [...qk.posts(batchId), type] : qk.posts(batchId),
    queryFn: () =>
      client
        .get(`/api/batches/${batchId}/posts/${type ? `?type=${type}` : ""}`)
        .then((r) => r.data.results),
    enabled: !!batchId,
  });
}

export function useInvalidatePosts() {
  const queryClient = useQueryClient();
  return (batchId) => queryClient.invalidateQueries({ queryKey: ["posts", batchId] });
}

// #general চ্যাট — ৪ সেকেন্ড polling দিয়ে near-live অনুভূতি (WebSocket ছাড়াই)
export function useMessages(batchId) {
  return useQuery({
    queryKey: qk.messages(batchId),
    queryFn: () =>
      client.get(`/api/batches/${batchId}/messages/`).then((r) => r.data.results),
    enabled: !!batchId,
    refetchInterval: 4000,
  });
}

export function useReplies(batchId, messageId, enabled) {
  return useQuery({
    queryKey: qk.replies(batchId, messageId),
    queryFn: () =>
      client
        .get(`/api/batches/${batchId}/messages/${messageId}/replies/`)
        .then((r) => r.data),
    enabled: !!batchId && !!messageId && enabled,
    refetchInterval: enabled ? 4000 : false,
  });
}

export function usePresence(batchId) {
  return useQuery({
    queryKey: qk.presence(batchId),
    queryFn: () =>
      client.get(`/api/batches/${batchId}/presence/`).then((r) => r.data),
    enabled: !!batchId,
    refetchInterval: 5000,
  });
}

export function useSendMessage(batchId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fd) => client.post(`/api/batches/${batchId}/messages/`, fd),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.messages(batchId) }),
  });
}

export function useSendReply(batchId, messageId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fd) =>
      client.post(`/api/batches/${batchId}/messages/${messageId}/replies/`, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.replies(batchId, messageId) });
      queryClient.invalidateQueries({ queryKey: qk.messages(batchId) });
    },
  });
}

export function useToggleReaction(batchId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) =>
      client.post(`/api/batches/${batchId}/messages/${messageId}/react/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.messages(batchId) }),
  });
}

export function useHeartbeat(batchId) {
  return useMutation({
    mutationFn: (typing) =>
      client.post(`/api/batches/${batchId}/presence/`, { typing: !!typing }),
  });
}
