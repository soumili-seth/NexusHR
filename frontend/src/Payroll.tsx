
import { useEffect, useState } from "react";

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  salaryMonth: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string | null;
  paymentStatus: string;
  createdAt: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  employmentStatus: string;
}

interface PayrollProps {
  authHeader: string;
}

const API = "http://localhost:8080/api";

function Payroll({ authHeader }: PayrollProps) {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [salaryMonth, setSalaryMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("0");
  const [deductions, setDeductions] = useState("0");

  async function loadPayrolls() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/payroll`, {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Could not load payroll records.");
      }

      setPayrolls(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payroll.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const response = await fetch(`${API}/employees`, {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Could not load employees.");
      }

      setEmployees(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employees.");
    }
  }

  useEffect(() => {
    loadPayrolls();
    loadEmployees();
  }, [authHeader]);

  async function generatePayroll(event: React.FormEvent) {
    event.preventDefault();

    if (!employeeId) {
      alert("Please select an employee.");
      return;
    }

    try {
      const params = new URLSearchParams({
        salaryMonth,
        basicSalary,
        allowances,
        deductions,
      });

      const response = await fetch(
        `${API}/payroll/generate/${employeeId}?${params.toString()}`,
        {
          method: "POST",
          headers: { Authorization: authHeader },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not generate payroll.");
      }

      alert("Payroll generated successfully!");

      setShowForm(false);
      setEmployeeId("");
      setBasicSalary("");
      setAllowances("0");
      setDeductions("0");

      await loadPayrolls();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to generate payroll.");
    }
  }

  async function updateStatus(
    payrollId: number,
    status: "PAID" | "PENDING"
  ) {
    try {
      const response = await fetch(
        `${API}/payroll/${payrollId}/status?status=${status}`,
        {
          method: "PATCH",
          headers: { Authorization: authHeader },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not update payment status.");
      }

      await loadPayrolls();
      alert("Payment status updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update payment.");
    }
  }

  const totalPayroll = payrolls.reduce(
    (total, payroll) => total + Number(payroll.netSalary),
    0
  );

  const paidCount = payrolls.filter(
    (payroll) => payroll.paymentStatus === "PAID"
  ).length;

  const pendingCount = payrolls.filter(
    (payroll) => payroll.paymentStatus === "PENDING"
  ).length;

  const money = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <section className="directory">
      <div className="section-header">
        <div>
          <h2>Payroll Management</h2>
          <p>Generate salaries and manage employee payments.</p>
        </div>

        <div>
          <button
            type="button"
            className="secondary-btn"
            onClick={loadPayrolls}
          >
            ↻ Refresh
          </button>

          <button
  type="button"
  className="primary-btn"
  onClick={() => {
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
  + Generate Payroll
</button>
        </div>
      </div>

      <section className="stats">
        <div className="stat-card">
          <span>Total Payroll</span>
          <h2>{money(totalPayroll)}</h2>
          <small>All recorded payroll</small>
        </div>

        <div className="stat-card">
          <span>Payroll Records</span>
          <h2>{payrolls.length}</h2>
          <small>Generated records</small>
        </div>

        <div className="stat-card">
          <span>Paid Payments</span>
          <h2>{paidCount}</h2>
          <small>Successfully paid</small>
        </div>

        <div className="stat-card">
          <span>Pending Payments</span>
          <h2>{pendingCount}</h2>
          <small>Awaiting payment</small>
        </div>
      </section>

      {showForm && (
        <div
          style={{
            display: "block",
            visibility: "visible",
            opacity: 1,
            position: "relative",
            zIndex: 10,
            background: "#ffffff",
            padding: "24px",
            margin: "24px 0",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            color: "#111827",
          }}
        >
          <form onSubmit={generatePayroll}>
            <div className="form-header">
              <div>
                <h2>Generate Employee Payroll</h2>
                <p>Enter the salary information below.</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <label>
                Employee
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                >
                  <option value="">Select employee</option>
                  {employees
                    .filter(
                      (employee) => employee.employmentStatus === "ACTIVE"
                    )
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.employeeCode})
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Salary Month
                <input
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  required
                />
              </label>

              <label>
                Basic Salary (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  required
                />
              </label>

              <label>
                Allowances (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={allowances}
                  onChange={(e) => setAllowances(e.target.value)}
                  required
                />
              </label>

              <label>
                Deductions (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                Generate Payroll
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p className="message">Loading payroll records...</p>
      ) : payrolls.length === 0 ? (
        <div className="empty">
          <h3>No payroll records found</h3>
          <p>Generate your first employee payroll.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>SALARY MONTH</th>
                <th>BASIC SALARY</th>
                <th>ALLOWANCES</th>
                <th>DEDUCTIONS</th>
                <th>NET SALARY</th>
                <th>PAYMENT DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {payrolls.map((payroll) => (
                <tr key={payroll.id}>
                  <td>
                    <strong>{payroll.employeeName}</strong>
                    <span className="subtext">{payroll.employeeCode}</span>
                  </td>
                  <td>{payroll.salaryMonth}</td>
                  <td>{money(Number(payroll.basicSalary))}</td>
                  <td>{money(Number(payroll.allowances))}</td>
                  <td>{money(Number(payroll.deductions))}</td>
                  <td><strong>{money(Number(payroll.netSalary))}</strong></td>
                  <td>{payroll.paymentDate || "—"}</td>
                  <td>
                    <span className="status">{payroll.paymentStatus}</span>
                  </td>
                  <td>
                    {payroll.paymentStatus === "PENDING" ? (
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => updateStatus(payroll.id, "PAID")}
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => updateStatus(payroll.id, "PENDING")}
                      >
                        Mark Pending
                      </button>
                    )}
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

export default Payroll;
