function TripReason({ tripReason, setTripReason }) {
  return (
    <>
      <button onClick={() => setTripReason("Business")}>
        Business
      </button>

      <button onClick={() => setTripReason("Leisure")}>
        Leisure
      </button>

      <button onClick={() => setTripReason("Other")}>
        Other
      </button>
    </>
  );
}

export default TripReason;