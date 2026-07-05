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

function Ratings({ questionAverages }) {
  const ratingsChartData = {
    labels: questionAverages.map((question) => question.label),
    datasets: [
      {
        label: "Average Rating",
        data: questionAverages.map((question) => question.average),
        backgroundColor: "#0f766e",
      },
    ],
  };

  return (
    <section className="dashboard-panel">
      <h2>Question Ratings</h2>

      <div className="chart-container">
        <Bar
          data={ratingsChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 5,
              },
            },
          }}
        />
      </div>

      <div className="responsive-table ratings-table-wrap">
        <table className="survey-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Average Rating</th>
              <th>Rated Responses</th>
            </tr>
          </thead>

          <tbody>
            {questionAverages.map((question) => (
              <tr key={question.key}>
                <td data-label="Question">{question.label}</td>
                <td data-label="Average Rating">{question.average}</td>
                <td data-label="Rated Responses">{question.responses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Ratings;
