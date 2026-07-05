import { useEffect, useState } from "react";
import logo from "../assets/aai-logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "../App.css";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [selectedAirport, setSelectedAirport] =
    useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/surveys")
      .then((res) => res.json())
      .then((data) => setSurveys(data))
      .catch((err) => console.log(err));
  }, []);

  const businessCount = surveys.filter(
    (s) => s.tripReason === "Business"
  ).length;

  const leisureCount = surveys.filter(
    (s) => s.tripReason === "Leisure"
  ).length;
  const airportCount = new Set(
  surveys.map((s) => s.airportCode)
).size;

const todayResponses = surveys.filter((s) => {
  
  return (
    new Date(s.submittedAt).toDateString() ===
    new Date().toDateString()
  );
}).length;
const ratingsArray = [];

surveys.forEach((survey) => {
  if (survey.ratings) {
    ratingsArray.push(
      survey.ratings.q1 || 0,
      survey.ratings.q2 || 0,
      survey.ratings.q3 || 0,
      survey.ratings.q4 || 0,
      survey.ratings.q5 || 0,
      survey.ratings.q6 || 0,
      survey.ratings.q7 || 0
    );
  }
});

const validRatings = ratingsArray.filter(
  (rating) => rating > 0
);

const averageRating =
  validRatings.length > 0
    ? (
        validRatings.reduce(
          (sum, rating) => sum + rating,
          0
        ) / validRatings.length
      ).toFixed(1)
    : 0;
    const satisfactionScore =
  ((averageRating / 5) * 100).toFixed(0);
  

  const airports = [
  "Test Airport",
  "Safdarjung Airport",
  "Indira Gandhi International Airport",
  "Chhatrapati Shivaji Maharaj International Airport",
  "Kempegowda International Airport",
  "Chennai International Airport",
  "Netaji Subhas Chandra Bose International Airport",
  "Rajiv Gandhi International Airport",
  "Cochin International Airport",
  "Sardar Vallabhbhai Patel International Airport",
  "Pune International Airport",
];

  const filteredSurveys =
    selectedAirport === "All"
      ? surveys
      : surveys.filter(

          (survey) =>
            survey.airportName ===
            selectedAirport
        );
const airportCounts = {};

surveys.forEach((survey) => {
  airportCounts[survey.airportCode] =
    (airportCounts[survey.airportCode] || 0) + 1;
});
const airportRatings = {};

surveys.forEach((survey) => {
  if (!survey.ratings) return;

  const total =
    (survey.ratings.q1 || 0) +
    (survey.ratings.q2 || 0) +
    (survey.ratings.q3 || 0) +
    (survey.ratings.q4 || 0) +
    (survey.ratings.q5 || 0) +
    (survey.ratings.q6 || 0) +
    (survey.ratings.q7 || 0);

  const avg = total / 7;

  if (!airportRatings[survey.airportName]) {
    airportRatings[survey.airportName] = [];
  }

  airportRatings[survey.airportName].push(avg);
});

let topAirport = "N/A";
let topRating = 0;

Object.keys(airportRatings).forEach((airport) => {
  const ratings = airportRatings[airport];

  const avg =
    ratings.reduce((a, b) => a + b, 0) /
    ratings.length;

  if (avg > topRating) {
    topRating = avg;
    topAirport = airport;
  }
});
const dateCounts = {};

surveys.forEach((survey) => {
  const date = new Date(
    survey.submittedAt
  ).toLocaleDateString();

  dateCounts[date] =
    (dateCounts[date] || 0) + 1;
});

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

const chartData = {
  labels: Object.keys(airportCounts),
  datasets: [
    
    {
      label: "Responses",
      data: Object.values(airportCounts),
      backgroundColor: "#2563eb",
    },
  ],
};
const exportToExcel = () => {
  alert("Excel Export Working");
};
const exportToPDF = () => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
doc.text(
  "Airport Customer Satisfaction Survey Report",
  14,
  15
);

doc.setFontSize(10);
doc.text(
  `Generated On: ${new Date().toLocaleString()}`,
  14,
  22
);

  const rows = filteredSurveys.map(
    (survey) => [
      survey.airportCode,
      survey.tripReason,
      survey.travelClass,

      survey.ratings?.q1 || "",
      survey.ratings?.q2 || "",
      survey.ratings?.q3 || "",
      survey.ratings?.q4 || "",
      survey.ratings?.q5 || "",
      survey.ratings?.q6 || "",
      survey.ratings?.q7 || "",

      survey.comments || "No Comments",
    ]
  );

  autoTable(doc, {
    head: [[
  "Airport",
  "Trip",
  "Class",
  "Parking",
  "Check-In",
  "Washrooms",
  "Security",
  "Food & Retail",
  "Boarding Gate",
  "Overall Experience",
  "Staff Behaviour",
  "Comments",
]],
    body: rows,
    startY: 30,
  });

  doc.save("AirportSurveyReport.pdf");
};
return(
    <div className="dashboard">
    <div className="dashboard-header">
  <img
    src={logo}
    alt="AAI Logo"
    className="dashboard-logo"
  />

  <div>
    <h1>Airport Authority of India</h1>
    
    <p>
      Airport Customer Satisfaction Analytics Dashboard
    </p>
  </div>
</div>

      <div className="stats-container">
        <div className="card">
          <h2>{surveys.length}</h2>
          <p>Total Responses</p>
        </div>

        <div className="card">
  <h2>{airportCount}</h2>
  <p>Airports with Feedback</p>
</div>

<div className="card">
  <h2>{todayResponses}</h2>
  <p>Today's Responses</p>
</div>
<div className="card">
  <h2>{satisfactionScore}%</h2>
  <p>Satisfaction Score</p>
</div>
<div className="card">
  <h2>{averageRating}</h2>
  <p>Average Rating</p>
  
</div>
<div className="card">
  <h2>{topRating.toFixed(1)}</h2>
  <p>Top Airport Rating</p>
  <small>{topAirport}</small>
</div>
</div>


      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <label>
          <b>Select Airport : </b>
        </label>

        <select
          value={selectedAirport}
          onChange={(e) =>
            setSelectedAirport(
              e.target.value
            )
          }
          style={{
            padding: "8px",
            marginLeft: "10px",
          }}
        >
          <option value="All">
            All Airports
          </option>

          {airports.map((airport) => (
            <option
              key={airport}
              value={airport}
            >
              {airport}
            </option>
          ))}
        </select>
        <button
  onClick={exportToExcel}
  style={{
    padding: "10px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "15px",
  }}
>
  📥 Export Report
</button>
<button
  onClick={exportToPDF}
  style={{
    padding: "10px 20px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  📄 Export PDF
</button>

      </div>
<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <h2>Airport Wise Feedback</h2>

  <div className="chart-container">
  <Bar
    data={chartData}
    options={{
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
    }}
  />
</div>
<h2 style={{ marginTop: "40px" }}>
  Date Wise Feedback Report
</h2>

<div className="chart-container">
  <Bar
    data={dateChartData}
    options={{
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
    }}
  />
</div>

</div>
      <table className="survey-table">
        <thead>
          <tr>
            <th>Airport</th>
            <th>Code</th>
            <th>Trip Reason</th>
            <th>Travel Class</th>
            <th>Return Trips</th>
            <th>Comments</th>
            <th>Submitted At</th>
          </tr>
        </thead>

        <tbody>
          {filteredSurveys.map(
            (survey) => (
              <tr key={survey._id}>
                <td>
                  {survey.airportName}
                </td>

                <td>
                  {survey.airportCode}
                </td>

                <td>
                  {survey.tripReason}
                </td>

                <td>
                  {survey.travelClass}
                </td>

                <td>
                  {survey.returnTrips}
                </td>

                <td>
                  {survey.comments || "No Comments"}                </td>

                <td>
                  {new Date(
                    survey.submittedAt
                  ).toLocaleString()}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;