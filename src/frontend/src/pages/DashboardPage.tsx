import React from "react";
import { Link } from "@tanstack/react-router";
import { useGetCallerUserProfile, useGetGoals, useGetProgressStats } from "../hooks/useQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target,
  Clock,
  Flame,
  Library,
  Plus,
  BookOpen,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning-foreground border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: goals, isLoading: goalsLoading } = useGetGoals();
  const { data: stats, isLoading: statsLoading } = useGetProgressStats();

  const recentGoals = goals?.slice(0, 3) ?? [];
  const totalStudyHours = stats ? Math.round(Number(stats.totalStudyMinutes) / 60) : 0;

  return (
    <div className="max-w-4xl mx-auto page-enter">
      {/* Welcome heading */}
      <header className="mb-8">
        {profileLoading ? (
          <Skeleton className="h-10 w-56 mb-2" />
        ) : (
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            {profile?.name ? `Hello, ${profile.name}!` : "Welcome back!"}
          </h1>
        )}
        <p className="text-muted-foreground text-base mt-2">
          Every step forward is progress. Here's your learning journey today.
        </p>
      </header>

      {/* Stats cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Your Progress Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Goals Completed",
              value: statsLoading ? null : Number(stats?.completedGoals ?? 0),
              icon: CheckCircle2,
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              label: "Study Hours",
              value: statsLoading ? null : totalStudyHours,
              icon: Clock,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Day Streak",
              value: statsLoading ? null : Number(stats?.currentStreak ?? 0),
              icon: Flame,
              color: "text-secondary",
              bg: "bg-secondary/10",
            },
            {
              label: "Total Goals",
              value: statsLoading ? null : Number(stats?.totalGoals ?? 0),
              icon: Target,
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card
              key={label}
              className="rounded-2xl shadow-card border-border hover:shadow-card-hover transition-shadow stagger-child"
            >
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`} aria-hidden="true">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {value === null ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick add buttons */}
      <section aria-labelledby="quick-actions-heading" className="mb-8">
        <h2 id="quick-actions-heading" className="font-serif text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-xl gap-2 shadow-xs"
            aria-label="Add a new goal"
          >
            <Link to="/goals">
              <Plus className="w-5 h-5" aria-hidden="true" />
              Add Goal
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl gap-2"
            aria-label="Log a study session"
          >
            <Link to="/study">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Log Study Session
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl gap-2"
            aria-label="Save a resource"
          >
            <Link to="/resources">
              <Library className="w-5 h-5" aria-hidden="true" />
              Save Resource
            </Link>
          </Button>
        </div>
      </section>

      {/* Recent goals */}
      <section aria-labelledby="recent-goals-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recent-goals-heading" className="font-serif text-xl font-semibold text-foreground">
            Recent Goals
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary gap-1 rounded-lg"
            aria-label="View all goals"
          >
            <Link to="/goals">
              View all <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {goalsLoading ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : recentGoals.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border shadow-none">
            <CardContent className="py-10 flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"
                aria-hidden="true"
              >
                <Target className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No goals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by adding your first learning goal.
                </p>
              </div>
              <Button asChild size="sm" className="rounded-xl mt-2">
                <Link to="/goals">
                  <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                  Add Your First Goal
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3" aria-label="Recent goals list">
            {recentGoals.map((goal) => (
              <li key={goal.title} className="stagger-child">
                <Card className="rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border-border">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {goal.completed ? (
                          <CheckCircle2
                            className="w-5 h-5 text-success shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <CardTitle className="text-base font-semibold text-foreground truncate">
                          {goal.title}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs rounded-full ${PRIORITY_COLORS[goal.priority] || ""}`}
                          aria-label={`Priority: ${PRIORITY_LABELS[goal.priority] || goal.priority}`}
                        >
                          {PRIORITY_LABELS[goal.priority] || goal.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs"
                          aria-label={`Category: ${goal.category}`}
                        >
                          {goal.category}
                        </Badge>
                        {goal.targetDate && (
                          <span className="text-xs text-muted-foreground">
                            <span className="sr-only">Target date: </span>
                            {goal.targetDate}
                          </span>
                        )}
                      </div>
                      {goal.completed && (
                        <span className="text-xs font-medium text-success">
                          <span className="sr-only">Status: </span>Completed ✓
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
