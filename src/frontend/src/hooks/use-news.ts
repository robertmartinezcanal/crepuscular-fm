import { createActor } from "@/backend";
import type { NewsItem } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNewsList() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNewsItem(id: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<NewsItem | null>({
    queryKey: ["news", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getNews(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreateNews() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; body: string }) => {
      if (!actor) throw new Error("El backend no está disponible");
      return actor.createNews(input.title, input.body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useUpdateNews() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: bigint; title: string; body: string }) => {
      if (!actor) throw new Error("El backend no está disponible");
      return actor.updateNews(input.id, input.title, input.body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useDeleteNews() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("El backend no está disponible");
      return actor.deleteNews(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}
