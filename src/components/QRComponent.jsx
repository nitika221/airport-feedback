import { QRCodeCanvas } from "qrcode.react";

function QRComponent() {
  const surveyUrl = "http://172.20.10.2:5173";

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Scan QR to Open Survey</h2>

      <QRCodeCanvas
        value={surveyUrl}
        size={250}
      />
    </div>
  );
}

export default QRComponent;