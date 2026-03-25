import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Experience, Manifest, Profile } from "../backend.d";
import type { EnergyReaction } from "../backend.d";
import { useActor } from "./useActor";

export function useAllManifests() {
  const { actor, isFetching } = useActor();
  return useQuery<(Manifest & { id: bigint })[]>({
    queryKey: ["manifests"],
    queryFn: async () => {
      if (!actor) return [];
      const manifests = await actor.getAllManifests();
      return manifests.map((m, i) => ({ ...m, id: BigInt(i) }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateManifest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
    }: { title: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createManifest(title, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manifests"] }),
  });
}

export function useBoostManifest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (manifestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.boostUpManifest(manifestId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manifests"] }),
  });
}

export function useSendBlessing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      manifestId,
      message,
    }: { manifestId: bigint; message: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendBlessing(manifestId, message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manifests"] }),
  });
}

export function useSendReaction() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      manifestId,
      reaction,
    }: { manifestId: bigint; reaction: EnergyReaction }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendEnergyReaction(manifestId, reaction);
    },
  });
}

export function useMarkAttained() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (manifestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markManifestAttained(manifestId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manifests"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useAddEnergyGratitude() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      energyType,
    }: { profileId: any; energyType: EnergyReaction }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addEnergyGratitude(profileId, energyType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useAddSayComment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      manifestId,
      text,
    }: { manifestId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSayComment(manifestId, text);
    },
  });
}

export type { Experience };
