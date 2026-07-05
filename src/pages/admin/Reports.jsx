function Reports({
  filteredSurveys,
  selectedAirport,
  onExportExcel,
  onExportPDF,
}) {
  return (
    <section className="dashboard-panel reports-panel">
      <h2>Reports</h2>

      <div className="report-summary">
        <div>
          <span>Selected Airport</span>
          <strong>{selectedAirport}</strong>
        </div>

        <div>
          <span>Responses in Report</span>
          <strong>{filteredSurveys.length}</strong>
        </div>
      </div>

      <div className="report-actions">
        <button className="export-btn excel" onClick={onExportExcel}>
          Export Excel
        </button>

        <button className="export-btn pdf" onClick={onExportPDF}>
          Export PDF
        </button>
      </div>
    </section>
  );
}

export default Reports;