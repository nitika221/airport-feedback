function TravelClass({ setTravelClass }) {
  return (
    <>
      <button onClick={() => setTravelClass("First Class")}>
        First Class
      </button>

      <button onClick={() => setTravelClass("Business/Upper Class")}>
        Business/Upper Class
      </button>

      <button onClick={() => setTravelClass("Economy")}>
        Economy
      </button>
    </>
  );
}

export default TravelClass;