import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Caption = string;
export type ManifestTitle = string;
export type ManifestId = bigint;
export type ExperienceId = bigint;
export interface Profile {
    bio: string;
    gratitudeStars: bigint;
    username: string;
    totalBoosts: bigint;
    gratitudeHearts: bigint;
    gratitude: Energy;
    wish: Energy;
    desire: Energy;
    totalBlessings: bigint;
    gratitudeAngles: bigint;
    mystery: Energy;
    manifestPower: Energy;
    avatar?: ExternalBlob;
}
export type Energy = bigint;
export type Blob = Uint8Array;
export type BlessingMessage = string;
export interface Experience {
    id: ExperienceId;
    media: Array<ExternalBlob>;
    user: Principal;
    caption: Caption;
}
export interface Blessing {
    blessing: BlessingMessage;
    sender: Principal;
}
export interface SayComment {
    text: string;
    sender: Principal;
}
export interface Manifest {
    sayComments: Array<SayComment>;
    title: string;
    ownerId: Principal;
    description: string;
    isAttained: boolean;
    blessings: Array<Blessing>;
    boostCount: bigint;
    reactions: Array<Reaction>;
}
export interface Reaction {
    type: EnergyReaction;
    sender: Principal;
}
export enum EnergyReaction {
    heart = "heart",
    star = "star",
    angelBadge = "angelBadge"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEnergyGratitude(profileId: Principal, energyType: EnergyReaction): Promise<void>;
    addExperience(media: Array<Blob>, caption: Caption): Promise<ExperienceId>;
    addSayComment(manifestId: ManifestId, text: string): Promise<SayComment>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    boostUpManifest(manifestId: ManifestId): Promise<void>;
    createManifest(title: string, description: string): Promise<ManifestId>;
    deleteExperience(experienceId: ExperienceId): Promise<void>;
    deleteManifest(manifestId: ManifestId): Promise<void>;
    deleteProfile(user: Principal): Promise<void>;
    getAdminManifests(admin: Principal): Promise<Array<Manifest>>;
    getAllManifests(): Promise<Array<Manifest>>;
    getAllProfiles(): Promise<Array<Profile>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExperience(id: ExperienceId): Promise<Experience | null>;
    getManifest(manifestId: ManifestId): Promise<Manifest | null>;
    getManifestBlessingCount(manifestId: ManifestId): Promise<bigint>;
    getManifestByOwner(user: Principal): Promise<Array<Manifest>>;
    getManifestSayComments(manifestId: ManifestId): Promise<Array<SayComment>>;
    getManifestsByTitle(substring: ManifestTitle): Promise<Array<Manifest>>;
    getProfile(user: Principal): Promise<Profile | null>;
    getTopUsers(limit: bigint): Promise<Array<Profile>>;
    getUserBlessings(user: Principal): Promise<Array<Blessing>>;
    getUserManifestsSnapshot(owner: Principal): Promise<Array<Manifest>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    markManifestAttained(manifestId: ManifestId): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    saveProfile(profile: Profile): Promise<void>;
    sendBlessing(manifestId: ManifestId, blessing: BlessingMessage): Promise<Blessing>;
    sendEnergyReaction(manifestId: ManifestId, reactionType: EnergyReaction): Promise<void>;
}
