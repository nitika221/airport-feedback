import { Link } from "react-router-dom";
import QRComponent from "../components/QRComponent";

function HomePage() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Airport Survey System</h1>

      <QRComponent />

      <br />
      <br />

      <Link to="/survey">
        <button>
          Open Survey Form
        </button>
      </Link>

      <br />
      <br />

      <Link to="/admin">
        <button>
          Open Admin Dashboard
        </button>
      </Link>
    </div>
  );
}

export default HomePage;