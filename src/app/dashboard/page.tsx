"use client";

import { useEffect, useState } from "react";

type UsageEvent = {
  id: number;
  eventType: string;
  activityType: string | null;
  page: string | null;
  durationMs: number | null;
  success: boolean | null;
  message: string | null;
  createdAt: string;
};

type DashboardData = {
  health: string;
  totalActivities: number;
  wordleCount: number;
  wordSearchCount: number;
  totalWords: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalGenerated: number;
  averageTimeMs: number;
  mostUsedActivityType: string | null;
  recentEvents: UsageEvent[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error(error);
        setError("Could not load dashboard metrics.");
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return (
      <section>
        <h2>Operational Dashboard</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (!data) {
    return <p>Loading dashboard...</p>;
  }

  const averageSeconds = (data.averageTimeMs / 1000).toFixed(1);

  return (
    <section>
      <h2>Operational Dashboard</h2>

      <p>
        Database-backed usage and monitoring information for the Phoneme
        Activity Builder.
      </p>

      <div className="dashboard-grid">
        <div className="builder-panel">
          <h3>Health</h3>
          <p>
            <strong>
              {data.health === "healthy" ? "Healthy" : "Unhealthy"}
            </strong>
          </p>
        </div>

        <div className="builder-panel">
          <h3>Total Activities</h3>
          <p>{data.totalActivities}</p>
        </div>

        <div className="builder-panel">
          <h3>Wordle Activities</h3>
          <p>{data.wordleCount}</p>
        </div>

        <div className="builder-panel">
          <h3>Word Search Activities</h3>
          <p>{data.wordSearchCount}</p>
        </div>

        <div className="builder-panel">
          <h3>Total Words</h3>
          <p>{data.totalWords}</p>
        </div>

        <div className="builder-panel">
          <h3>Total Generated</h3>
          <p>{data.totalGenerated}</p>
        </div>

        <div className="builder-panel">
          <h3>Successful Generations</h3>
          <p>{data.successfulGenerations}</p>
        </div>

        <div className="builder-panel">
          <h3>Failed Generations</h3>
          <p>{data.failedGenerations}</p>
        </div>

        <div className="builder-panel">
          <h3>Average Time on Page</h3>
          <p>{averageSeconds} seconds</p>
        </div>

        <div className="builder-panel">
          <h3>Most-used Activity Type</h3>
          <p>{data.mostUsedActivityType ?? "No usage yet"}</p>
        </div>
      </div>

      {data.failedGenerations > 0 && (
        <div className="builder-panel">
          <h3>Warning</h3>
          <p>
            Failed generations have been recorded. Review recent events for
            more information.
          </p>
        </div>
      )}

      <div className="builder-panel">
        <h3>Recent Events</h3>

        {data.recentEvents.length === 0 ? (
          <p>No usage events recorded yet.</p>
        ) : (
          <ul>
            {data.recentEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.eventType}</strong>
                {event.activityType
                  ? ` — ${event.activityType}`
                  : ""}
                {event.message ? ` — ${event.message}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}