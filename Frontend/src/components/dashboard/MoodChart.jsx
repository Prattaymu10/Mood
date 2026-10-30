import { useMemo } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { buildChartData } from "../../utils/stats";
import { RATINGS, nearestRating } from "../../utils/mood";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const TICK = "rgb(156, 163, 175)";
const GRID = "rgba(156, 163, 175, 0.1)";

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      borderColor: "rgba(59, 130, 246, 0.5)",
      borderWidth: 1,
      callbacks: {
        label: (context) => {
          const value = context.parsed.y;
          if (value === null) return "No data";
          return `Mood: ${value} (${nearestRating(value).label})`;
        },
      },
    },
  },
  scales: {
    y: {
      min: 1,
      max: 5,
      ticks: {
        color: TICK,
        stepSize: 1,
        callback: (value) => RATINGS.find((r) => r.value === value)?.label ?? "",
      },
      grid: { color: GRID },
    },
    x: { ticks: { color: TICK }, grid: { color: GRID } },
  },
  elements: { point: { hoverBorderWidth: 3 } },
};

/** `moods` = 30-day history ({ rating, date }); the chart shows the last 7 days. */
export default function MoodChart({ moods }) {
  const data = useMemo(() => {
    const { labels, values } = buildChartData(moods);
    return {
      labels,
      datasets: [
        {
          label: "Average Mood",
          data: values,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "rgb(255, 255, 255)",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          spanGaps: true,
        },
      ],
    };
  }, [moods]);

  return (
    <div className="relative h-80 mb-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm" role="img" aria-label="7-day mood trend chart">
      {moods.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">No data to display</div>
      ) : (
        <div className="relative h-full w-full">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
}
