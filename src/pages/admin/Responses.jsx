function Responses({ surveys }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-title-row">
        <h2>Survey Responses</h2>
        <span>{surveys.length} records</span>
      </div>

      <div className="responsive-table">
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
                <td data-label="Airport">{survey.airportName}</td>
                <td data-label="Code">{survey.airportCode}</td>
                <td data-label="Trip Reason">{survey.tripReason}</td>
                <td data-label="Travel Class">{survey.travelClass}</td>
                <td data-label="Return Trips">{survey.returnTrips}</td>
                <td data-label="Comments">
                  {survey.comments?.trim() ? survey.comments : "No Comments"}
                </td>
                <td data-label="Submitted At">
                  {survey.submittedAt
                    ? new Date(survey.submittedAt).toLocaleString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Responses;