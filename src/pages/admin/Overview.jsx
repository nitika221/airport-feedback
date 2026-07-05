import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Overview({ data }) {
  const { stats, airportCounts, dateCounts } = data;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const airportChartData = {
    labels: Object.keys(airportCounts),
    datasets: [
      {
        label: "Responses",
        data: Object.values(airportCounts),
        backgroundColor: "#2563eb",
      },
    ],
  };

  const dateChartData = {
    labels: Object.keys(dateCounts),
    datasets: [
      {
        label: "Feedbacks Per Day",
        data: Object.values(dateCounts),
        backgroundColor: "#16a34a",
      },
    ],
  };

  return (
    <>
      <div className="stats-container">
        <div className="card">
          <h2>{stats.totalResponses}</h2>
          <p>Total Responses</p>
        </div>

        <div className="card">
          <h2>{stats.airportCount}</h2>
          <p>Airports with Feedback</p>
        </div>

        <div className="card">
          <h2>{stats.todayResponses}</h2>
          <p>Today's Responses</p>
        </div>

        <div className="card">
          <h2>{stats.satisfactionScore}%</h2>
          <p>Satisfaction Score</p>
        </div>

        <div className="card">
          <h2>{stats.averageRating}</h2>
          <p>Average Rating</p>
        </div>

        <div className="card">
          <h2>{stats.topRating.toFixed(1)}</h2>
          <p>Top Airport Rating</p>
          <small>{stats.topAirport}</small>
        </div>
      </div>

      <section className="dashboard-panel">
        <h2>Airport Wise Feedback</h2>

        <div className="chart-container">
          <Bar data={airportChartData} options={chartOptions} />
        </div>

        <h2 className="section-heading">Date Wise Feedback Report</h2>

        <div className="chart-container">
          <Bar data={dateChartData} options={chartOptions} />
        </div>
      </section>
    </>
  );
}

export default Overview;