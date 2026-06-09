import { useEffect, useState } from "react";
import "../App.css";

function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);

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

  return (
    <div className="dashboard">
      <h1>✈️ Airport Survey Admin Dashboard</h1>

      <div className="stats-container">
        <div className="card">
          <h2>{surveys.length}</h2>
          <p>Total Responses</p>
        </div>

        <div className="card">
          <h2>{businessCount}</h2>
          <p>Business Trips</p>
        </div>

        <div className="card">
          <h2>{leisureCount}</h2>
          <p>Leisure Trips</p>
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
          {surveys.map((survey) => (
            <tr key={survey._id}>
              <td>{survey.airportName}</td>
              <td>{survey.airportCode}</td>
              <td>{survey.tripReason}</td>
              <td>{survey.travelClass}</td>
              <td>{survey.returnTrips}</td>
              <td>{survey.comments}</td>
              <td>
                {new Date(
                  survey.submittedAt
                ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;