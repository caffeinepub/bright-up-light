import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Goal, StudySession, Resource, UserProfile } from "../backend.d";

// ---- User Profile ----

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ---- Goals ----

export function useGetGoals() {
  const { actor, isFetching } = useActor();
  return useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: Goal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createGoal(goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["progressStats"] });
    },
  });
}

export function useUpdateGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, updatedGoal }: { title: string; updatedGoal: Goal }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateGoal(title, updatedGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["progressStats"] });
    },
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteGoal(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["progressStats"] });
    },
  });
}

export function useMarkGoalComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markGoalComplete(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["progressStats"] });
    },
  });
}

// ---- Study Sessions ----

export function useGetStudySessions() {
  const { actor, isFetching } = useActor();
  return useQuery<StudySession[]>({
    queryKey: ["studySessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudySessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudySession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: StudySession) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStudySession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
      queryClient.invalidateQueries({ queryKey: ["progressStats"] });
    },
  });
}

export function useDeleteStudySession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteStudySession(subject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
      queryClient.invalidateQueries({ queryKey: ["progressStats"] });
    },
  });
}

// ---- Resources ----

export function useGetResources() {
  const { actor, isFetching } = useActor();
  return useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResources();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resource: Resource) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addResource(resource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useUpdateResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      updatedResource,
    }: {
      title: string;
      updatedResource: Resource;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateResource(title, updatedResource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useDeleteResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteResource(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

// ---- Progress Stats ----

export function useGetProgressStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["progressStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProgressStats();
    },
    enabled: !!actor && !isFetching,
  });
}
