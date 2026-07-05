import { QRCodeCanvas } from "qrcode.react";

function QRComponent() {
  const surveyUrl =
    "http://192.168.1.13:5173/survey";

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      <h1>Airport Survey System</h1>

      <h2>
        Scan QR Code To Open Survey
      </h2>

      <QRCodeCanvas
        value={surveyUrl}
        size={250}
      />
    </div>
  );
}

export default QRComponent;