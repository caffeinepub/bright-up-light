import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Resource {
    url: string;
    title: string;
    notes?: string;
    category: string;
}
export interface StudySession {
    subject: string;
    date: string;
    durationMinutes: bigint;
    notes?: string;
}
export interface ProgressStats {
    totalStudyMinutes: bigint;
    totalGoals: bigint;
    completedGoals: bigint;
    currentStreak: bigint;
    distinctStudyDays: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Goal {
    title: string;
    completed: boolean;
    description: string;
    targetDate: string;
    category: string;
    priority: Priority;
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addResource(resource: Resource): Promise<void>;
    addStudySession(session: StudySession): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGoal(goal: Goal): Promise<void>;
    deleteGoal(title: string): Promise<void>;
    deleteResource(title: string): Promise<void>;
    deleteStudySession(subject: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGoals(): Promise<Array<Goal>>;
    getProgressStats(): Promise<ProgressStats>;
    getResources(): Promise<Array<Resource>>;
    getStudySessions(): Promise<Array<StudySession>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markGoalComplete(title: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateGoal(title: string, updatedGoal: Goal): Promise<void>;
    updateResource(title: string, updatedResource: Resource): Promise<void>;
}
