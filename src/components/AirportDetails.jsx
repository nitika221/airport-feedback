function AirportDetails({ airportName, airportCode }) {
  return (
    <div className="form-grid">
      <input value={airportName} readOnly />
      <input value={airportCode} readOnly />
    </div>
  );
}

export default AirportDetails;