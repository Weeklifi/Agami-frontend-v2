import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";

// Query key convention: ["resource", ...params] — একই key হলে React Query
// নিজে থেকেই cache শেয়ার করে, আলাদা পেজ থেকে একই data চাইলেও দ্বিতীয়বার
// network call লাগে না (staleTime শেষ না হওয়া পর্যন্ত)।
export const qk = {
  myBatches: ["batches", "my"],
  teacherBatches: ["batches", "teacher"],
  posts: (batchId) => ["posts", batchId],
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
