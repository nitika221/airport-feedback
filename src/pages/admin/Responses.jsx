import { useState } from "react";

function Responses({ surveys }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  if (surveys.length === 0) {
    return (
      <section className="dashboard-panel">
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <h2 style={{ color: "#1e3a8a" }}>
            📭 No Feedback Available
          </h2>

          <p style={{ color: "#666", marginTop: "10px" }}>
            No survey responses found for the selected airport.
          </p>

          <p style={{ color: "#999" }}>
            Please select another airport or wait for new responses.
          </p>
        </div>
      </section>
    );
  }

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
            <th>Issue Photo</th>
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

<td data-label="Issue Photo">
  {survey.photos?.length > 0 ? (
    <div
      style={{
        display: "flex",
        gap: "5px",
        flexWrap: "wrap",
      }}
    >
      {survey.photos.map((img, index) => (
        <img
          key={index}
          src={`http://127.0.0.1:5000${img}`}
          alt={`Issue ${index + 1}`}
          onClick={() => {
            setSelectedImages(survey.photos);
            setCurrentImage(index);
          }}
          style={{
            width: "70px",
            height: "70px",
            objectFit: "cover",
            borderRadius: "8px",
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  ) : (
    "No Photo"
  )}
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
      {selectedImages.length > 0 && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <button
      onClick={() =>
        setCurrentImage((prev) =>
          prev === 0 ? selectedImages.length - 1 : prev - 1
        )
      }
      style={{
        position: "absolute",
        left: "40px",
        fontSize: "40px",
        color: "#fff",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      ❮
    </button>

    <img
      src={`http://127.0.0.1:5000${selectedImages[currentImage]}`}
      alt="Preview"
      style={{
        maxWidth: "80%",
        maxHeight: "80%",
        borderRadius: "10px",
      }}
    />

    <button
      onClick={() =>
        setCurrentImage((prev) =>
          prev === selectedImages.length - 1 ? 0 : prev + 1
        )
      }
      style={{
        position: "absolute",
        right: "40px",
        fontSize: "40px",
        color: "#fff",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      ❯
    </button>

    <button
      onClick={() => setSelectedImages([])}
      style={{
        position: "absolute",
        top: "20px",
        right: "30px",
        fontSize: "32px",
        color: "#fff",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      ✕
    </button>
  </div>
)}
    </section>
  );
}

export default Responses;