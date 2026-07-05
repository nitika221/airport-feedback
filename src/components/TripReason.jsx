function TripReason({ tripReason, setTripReason }) {
  return (
    <>
      <button
        onClick={() => setTripReason("Business")}
        className={tripReason === "Business" ? "active-choice" : ""}
      >
        Business
      </button>

      <button
        onClick={() => setTripReason("Leisure")}
        className={tripReason === "Leisure" ? "active-choice" : ""}
      >
        Leisure
      </button>

      <button
        onClick={() => setTripReason("Other")}
        className={tripReason === "Other" ? "active-choice" : ""}
      >
        Other
      </button>
    </>
  );
}

export default TripReason;