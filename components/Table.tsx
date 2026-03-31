import { TimeRecord } from "@/types";

interface TableProps {
  data: TimeRecord[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function Table({ data, onDelete, isLoading }: TableProps) {
  // Calculate total hours
  const totalHours = data.reduce((sum, record) => {
    return sum + Number(record.total_hours || 0);
  }, 0);

  if (data.length === 0) {
    return (
      <div className="w-full mt-6 bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-500 text-lg">No time records yet.</p>
        <p className="text-gray-400 text-sm mt-2">
          Add your first entry using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-center font-semibold">AM In</th>
              <th className="px-4 py-3 text-center font-semibold">AM Out</th>
              <th className="px-4 py-3 text-center font-semibold">PM In</th>
              <th className="px-4 py-3 text-center font-semibold">PM Out</th>
              <th className="px-4 py-3 text-right font-semibold">Hours</th>
              {onDelete && (
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr
                key={record.id || index}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {record.am_in}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {record.am_out}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {record.pm_in}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {record.pm_out}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-blue-600">
                  {record.total_hours} h
                </td>
                {onDelete && record.id && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDelete(record.id!)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 border-t text-right">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Total Hours:</span>{" "}
          <span className="text-lg font-bold text-blue-600">
            {totalHours.toFixed(2)} h
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {data.length} record{data.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
