import { createActor } from "@/backend";
import type { ProgramSlot } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export function useSchedule() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProgramSlot[]>({
    queryKey: ["schedule"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSchedule();
    },
    enabled: !!actor && !isFetching,
  });
}
