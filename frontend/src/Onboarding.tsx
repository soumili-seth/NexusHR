
import { useEffect, useState } from "react";
import { API_BASE } from "./api";

interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  employmentStatus: string;
}

interface OnboardingRecord {
  id: number;
  employee: Employee;
  onboardingStatus: string;
  documentsVerified: boolean;
  equipmentAllocated: boolean;
  orientationCompleted: boolean;
  hrRepresentative: string;
  startDate: string;
  completionDate: string | null;
  createdAt: string;
}

interface OnboardingProps {
  authHeader: string;
  employees: Employee[];
}

const API = `${API_BASE}/api/onboarding`;

function Onboarding({ authHeader, employees }: OnboardingProps) {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [hrRepresentative, setHrRepresentative] = useState("HR Team");
  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRecords() {
    try {
      setLoading(true);

      const response = await fetch(API, {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Could not load onboarding records.");
      }

      const data: OnboardingRecord[] = await response.json();
      setRecords(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load onboarding records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authHeader) {
      loadRecords();
    }
  }, [authHeader]);

  async function createOnboarding(event: React.FormEvent) {
    event.preventDefault();

    if (!employeeId) {
      alert("Please select an employee.");
      return;
    }

    try {
      const params = new URLSearchParams({
        employeeId,
        hrRepresentative,
        startDate,
      });

      const response = await fetch(`${API}?${params.toString()}`, {
        method: "POST",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not create onboarding record.");
      }

      setEmployeeId("");
      setHrRepresentative("HR Team");
      setStartDate(new Date().toLocaleDateString("en-CA"));

      await loadRecords();
      alert("Onboarding record created successfully!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to create onboarding record."
      );
    }
  }

  async function updateRecord(
    id: number,
    field: string,
    value: string | boolean
  ) {
    try {
      const params = new URLSearchParams({
        [field]: String(value),
      });

      const response = await fetch(`${API}/${id}?${params.toString()}`, {
        method: "PATCH",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to update onboarding record.");
      }

      await loadRecords();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not update onboarding record."
      );

      await loadRecords();
    }
  }

  async function deleteRecord(id: number, employeeName: string) {
    if (
      !window.confirm(
        `Delete the onboarding record for ${employeeName}? This will not delete the employee.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Unable to delete onboarding record.");
      }

      await loadRecords();
      alert("Onboarding record deleted successfully.");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not delete onboarding record."
      );
    }
  }

  const notStarted = records.filter(
    (record) => record.onboardingStatus === "NOT_STARTED"
  ).length;

  const inProgress = records.filter(
    (record) => record.onboardingStatus === "IN_PROGRESS"
  ).length;

  const completed = records.filter(
    (record) => record.onboardingStatus === "COMPLETED"
  ).length;

  const availableEmployees = employees.filter(
    (employee) =>
      employee.employmentStatus === "ACTIVE" &&
      !records.some((record) => record.employee.id === employee.id)
  );

  return (
    <section className="directory">
      <div className="section-header">
        <div>
          <h2>Employee Onboarding</h2>
          <p>Track new employee onboarding and joining activities.</p>
        </div>

        <button className="secondary-btn" onClick={loadRecords}>
          ↻ Refresh
        </button>
      </div>

      <section className="stats">
        <div className="stat-card">
          <span>Total Onboarding</span>
          <h2>{records.length}</h2>
          <small>Registered records</small>
        </div>

        <div className="stat-card">
          <span>Not Started</span>
          <h2>{notStarted}</h2>
          <small>Awaiting onboarding</small>
        </div>

        <div className="stat-card">
          <span>In Progress</span>
          <h2>{inProgress}</h2>
          <small>Activities underway</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <h2>{completed}</h2>
          <small>Successfully onboarded</small>
        </div>
      </section>

      <div className="section-header">
        <div>
          <h2>Create Onboarding Record</h2>
          <p>Start the onboarding process for an active employee.</p>
        </div>
      </div>

      <form className="attendance-actions" onSubmit={createOnboarding}>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        >
          <option value="">Select Employee</option>
          {availableEmployees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName} (
              {employee.employeeCode})
            </option>
          ))}
        </select>

        <input
          value={hrRepresentative}
          onChange={(e) => setHrRepresentative(e.target.value)}
          placeholder="HR Representative"
          required
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <button
          type="submit"
          className="primary-btn"
          disabled={availableEmployees.length === 0}
        >
          + Create Onboarding
        </button>
      </form>

      {availableEmployees.length === 0 && (
        <p className="message">
          All active employees already have onboarding records, or there are
          no active employees available.
        </p>
      )}

      <div className="section-header">
        <div>
          <h2>Onboarding Records</h2>
          <p>Manage employee onboarding progress and activities.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p className="message">Loading onboarding records...</p>
      ) : records.length === 0 ? (
        <div className="empty">
          <h3>No onboarding records found</h3>
          <p>Create an onboarding record to get started.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>HR REPRESENTATIVE</th>
                <th>START DATE</th>
                <th>CHECKLIST</th>
                <th>STATUS</th>
                <th>COMPLETION DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>
                      {record.employee.firstName}{" "}
                      {record.employee.lastName}
                    </strong>
                    <span className="subtext">
                      {record.employee.employeeCode}
                    </span>
                  </td>

                  <td>{record.hrRepresentative || "—"}</td>

                  <td>{record.startDate || "—"}</td>

                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={record.documentsVerified}
                        onChange={(e) =>
                          updateRecord(
                            record.id,
                            "documentsVerified",
                            e.target.checked
                          )
                        }
                        disabled={record.onboardingStatus === "COMPLETED"}
                      />
                      Documents
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={record.equipmentAllocated}
                        onChange={(e) =>
                          updateRecord(
                            record.id,
                            "equipmentAllocated",
                            e.target.checked
                          )
                        }
                        disabled={record.onboardingStatus === "COMPLETED"}
                      />
                      Equipment
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={record.orientationCompleted}
                        onChange={(e) =>
                          updateRecord(
                            record.id,
                            "orientationCompleted",
                            e.target.checked
                          )
                        }
                        disabled={record.onboardingStatus === "COMPLETED"}
                      />
                      Orientation
                    </label>
                  </td>

                  <td>
                    <select
                      value={record.onboardingStatus}
                      onChange={(e) =>
                        updateRecord(
                          record.id,
                          "onboardingStatus",
                          e.target.value
                        )
                      }
                      disabled={record.onboardingStatus === "COMPLETED"}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>

                  <td>{record.completionDate || "—"}</td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteRecord(
                          record.id,
                          `${record.employee.firstName} ${record.employee.lastName}`
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Onboarding;
