function SurveyTable({ comments, setComments }) {
  return (
    <table>
      <tbody>
        <tr>
          <td>1</td>
          <td>Experience at parking facility?</td>
        </tr>

        <tr>
          <td>Comments</td>
          <td>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default SurveyTable;