export default function Table({ data }) {
  return (
    <table className="w-full mt-6 border">
      <thead>
        <tr className="bg-gray-200">
          <th>Date</th>
          <th>AM</th>
          <th>PM</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.id} className="text-center">
            <td>{d.date}</td>
            <td>{d.am_in} - {d.am_out}</td>
            <td>{d.pm_in} - {d.pm_out}</td>
            <td>{d.total_hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}