
import { useEffect, useState } from "react";
import "./App.css";
import Payroll from "./Payroll";
import Performance from "./Performance";
import Onboarding from "./Onboarding";
import Dashboard from "./Dashboard";
import { API_BASE } from "./api";

interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentStatus: string;
}

interface Attendance {
  id: number;
  employee: Employee;
  attendanceDate: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
}

interface Leave {
  id: number;
  employee: Employee;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  appliedDate: string;
  reviewedBy: string | null;
}

const API = `${API_BASE}/api/employees`;

const emptyForm = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  employmentStatus: "ACTIVE",
};

function App() {
  const [authHeader, setAuthHeader] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loginError, setLoginError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveFilter, setLeaveFilter] = useState("ALL");
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");

    try {
      const loginResponse = await fetch(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username.trim(),
            password: password,
          }),
        }
      );

      if (!loginResponse.ok) {
        throw new Error("Invalid username or password.");
      }

      const data: {
        token: string;
        tokenType: string;
        expiresIn: number;
        email: string;
        roles: string[];
      } = await loginResponse.json();

      const userRole = data.roles.find(
        (authority) =>
          authority === "ROLE_ADMIN" ||
          authority === "ROLE_HR"
      );

      if (!userRole || !data.token) {
        throw new Error("Invalid authentication response.");
      }

      const bearerHeader = `${data.tokenType || "Bearer"} ${data.token}`;

      setAuthHeader(bearerHeader);
      setRole(userRole === "ROLE_ADMIN" ? "ADMIN" : "HR");
      setPassword("");
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(
        "Login failed. Check your credentials and backend connection."
      );
    }
  }

  function logout() {
    setAuthHeader("");
    setUsername("");
    setPassword("");
    setRole("");
    setEmployees([]);
  }

  async function loadEmployees() {
    if (!authHeader) return;

    try {
      setLoading(true);

      const response = await fetch(API, {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) throw new Error("Could not load employees.");

      setEmployees(await response.json());
      setError("");
    } catch {
      setError("Could not load employees. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendance() {
    if (!authHeader) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/attendance`,
        {
          headers: { Authorization: authHeader },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load attendance.");
      }

      const data: Attendance[] = await response.json();
      setAttendance(data);
    } catch (err) {
      console.error("Attendance loading failed:", err);
      setError("Could not load attendance records.");
    }
  }

  async function loadLeaves() {
    if (!authHeader) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/leaves`,
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load leave applications.");
      }

      const data: Leave[] = await response.json();
      setLeaves(data);
    } catch (err) {
      console.error("Leave loading failed:", err);
      setError("Could not load leave applications.");
    }
  }

  async function updateLeaveStatus(
    leaveId: number,
    status: "APPROVED" | "REJECTED"
  ) {
    try {
      const response = await fetch(
        `${API_BASE}/api/leaves/${leaveId}/status?status=${status}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authHeader,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to update leave status.");
      }

      await loadLeaves();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not update leave status."
      );
    }
  }

  async function checkOut(attendanceId: number) {
    try {
      const response = await fetch(
        `${API_BASE}/api/attendance/checkout/${attendanceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: authHeader,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to check out.");
      }

      await loadAttendance();
      alert("Check-out recorded successfully!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Could not complete check-out."
      );
    }
  }

  useEffect(() => {
    if (authHeader) {
      loadEmployees();
      loadAttendance();
      loadLeaves();
    }
  }, [authHeader]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setForm({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate || "",
      employmentStatus: employee.employmentStatus || "ACTIVE",
    });

    setEditingId(employee.id);
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save employee.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function deactivateEmployee(id: number) {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee || employee.employmentStatus === "INACTIVE") {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Unable to deactivate employee.");
      }

      await loadEmployees();
      alert("Employee deactivated successfully.");
    } catch {
      alert("Could not deactivate employee.");
    }
  }

  async function activateEmployee(id: number) {
    try {
      const response = await fetch(`${API}/${id}/activate`, {
        method: "PATCH",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Unable to reactivate employee.");
      }

      await loadEmployees();
      alert("Employee reactivated successfully.");
    } catch {
      alert("Could not reactivate employee.");
    }
  }

  const activeCount = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE"
  ).length;

  const departments = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  ).size;

  if (!authHeader) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={login}>
          <div className="brand-icon">N</div>
          <h1>NexusHR</h1>
          <p>Workforce Intelligence Platform</p>

          <h2>Welcome back</h2>
          <p>Sign in to access your workspace.</p>

          <label>
            Email Address
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {loginError && <div className="error">{loginError}</div>}

          <button className="primary-btn" type="submit">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <div>
            <h2>NexusHR</h2>
            <span>WORKFORCE INTELLIGENCE</span>
          </div>
        </div>

        <p className="nav-heading">MAIN MENU</p>

        <button
          type="button"
          className={`nav-item ${selectedPage === "Dashboard" ? "selected" : ""}`}
          onClick={() => setSelectedPage("Dashboard")}
        >
          ▦ &nbsp; Dashboard
        </button>

        <button
          type="button"
          className={`nav-item ${selectedPage === "Employees" ? "selected" : ""}`}
          onClick={() => setSelectedPage("Employees")}
        >
          ♙ &nbsp; Employees
        </button>

        <button
          type="button"
          className={`nav-item ${selectedPage === "Attendance" ? "selected" : ""}`}
          onClick={() => setSelectedPage("Attendance")}
        >
          ◷ &nbsp; Attendance
        </button>

        <button
          type="button"
          className={`nav-item ${selectedPage === "Leave Management" ? "selected" : ""}`}
          onClick={() => setSelectedPage("Leave Management")}
        >
          ▤ &nbsp; Leave Management
        </button>

        <button
          className={`nav-item ${selectedPage === "Payroll" ? "active" : ""}`}
          onClick={() => setSelectedPage("Payroll")}
        >
          ▧ &nbsp; Payroll
        </button>

        <button
          type="button"
          className={`nav-item ${
            selectedPage === "Performance" ? "selected" : ""
          }`}
          onClick={() => setSelectedPage("Performance")}
        >
          ◈ &nbsp; Performance
        </button>

        <button
          type="button"
          className={`nav-item ${
            selectedPage === "Onboarding" ? "selected" : ""
          }`}
          onClick={() => setSelectedPage("Onboarding")}
        >
          ◉ &nbsp; Onboarding
        </button>

        <div className="sidebar-bottom">
          <div className="profile-avatar">
            {role === "ADMIN" ? "AD" : "HR"}
          </div>

          <div>
            <strong>{role === "ADMIN" ? "Administrator" : "HR User"}</strong>
            <span>{role} Account</span>
          </div>

          <button className="action-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Dashboard</span>
            <h1>Dashboard Overview</h1>
          </div>
          <div className="top-right">
            <span className="online-dot"></span>
            System Online
          </div>
        </header>

        {selectedPage === "Employees" && (
          <>
            <section className="welcome">
              <div>
                <span className="eyebrow">HUMAN RESOURCES MANAGEMENT</span>
                <h2>Welcome to NexusHR 👋</h2>
                <p>Manage your workforce, people and organizational growth.</p>
              </div>
              <button className="primary-btn" onClick={openAddForm}>
                + Add Employee
              </button>
            </section>

            <section className="stats">
              <div className="stat-card">
                <span>Total Employees</span>
                <h2>{employees.length}</h2>
                <small>Registered workforce</small>
              </div>
              <div className="stat-card">
                <span>Active Employees</span>
                <h2>{activeCount}</h2>
                <small>Currently active</small>
              </div>
              <div className="stat-card">
                <span>Departments</span>
                <h2>{departments}</h2>
                <small>Unique departments</small>
              </div>
              <div className="stat-card">
                <span>Inactive Employees</span>
                <h2>{employees.length - activeCount}</h2>
                <small>Other employment statuses</small>
              </div>
            </section>

            <section className="directory">
              <div className="section-header">
                <div>
                  <h2>Employee Directory</h2>
                  <p>Manage and monitor your organization's workforce.</p>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    alert("Refresh button clicked!");
                    loadLeaves();
                  }}
                >
                  ↻ Refresh
                </button>
              </div>

              {error && <div className="error">{error}</div>}

              {loading ? (
                <p className="message">Loading employees...</p>
              ) : employees.length === 0 ? (
                <div className="empty">
                  <h3>No employees found</h3>
                  <p>Add your first employee to get started.</p>
                  <button className="primary-btn" onClick={openAddForm}>
                    + Add Employee
                  </button>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>EMPLOYEE</th>
                        <th>DEPARTMENT</th>
                        <th>DESIGNATION</th>
                        <th>JOINING DATE</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <strong>
                              {employee.firstName} {employee.lastName}
                            </strong>
                            <span className="subtext">{employee.email}</span>
                            <span className="subtext">{employee.employeeCode}</span>
                          </td>
                          <td>{employee.department}</td>
                          <td>{employee.designation}</td>
                          <td>{employee.joiningDate}</td>
                          <td>
                            <span className="status">
                              {employee.employmentStatus}
                            </span>
                          </td>
                          <td>
                            <button
                              className="action-btn"
                              onClick={() => openEditForm(employee)}
                            >
                              Edit
                            </button>
                            {employee.employmentStatus !== "INACTIVE" && (
                              <button
                                className="delete-btn"
                                onClick={() => deactivateEmployee(employee.id)}
                              >
                                Deactivate
                              </button>
                            )}
                            {employee.employmentStatus === "INACTIVE" && (
                              <button
                                className="action-btn"
                                onClick={() => activateEmployee(employee.id)}
                              >
                                Reactivate
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
          </>
        )}

        {selectedPage === "Dashboard" && (
          <Dashboard
            authHeader={authHeader}
            employees={employees}
          />
        )}

        {selectedPage === "Attendance" && (
          <section className="directory">
            <div className="section-header">
              <div>
                <h2>Attendance Management</h2>
                <p>View employee attendance and check-in records.</p>
              </div>

              <button
                className="secondary-btn"
                onClick={loadAttendance}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="attendance-actions">
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LEAVE">Leave</option>
              </select>

              <select id="attendanceEmployee">
                {employees
                  .filter((employee) => employee.employmentStatus === "ACTIVE")
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
              </select>

              <button
                className="primary-btn"
                disabled={!employees.some(
                  (employee) => employee.employmentStatus === "ACTIVE"
                )}
                onClick={async () => {
                  const employeeId = (
                    document.getElementById("attendanceEmployee") as HTMLSelectElement
                  ).value;

                  try {
                    const response = await fetch(
                      `${API_BASE}/api/attendance/mark/${employeeId}?status=${attendanceStatus}`,
                      {
                        method: "POST",
                        headers: { Authorization: authHeader },
                      }
                    );

                    if (!response.ok) {
                      alert("Could not mark attendance. Check whether attendance is already marked today.");
                      return;
                    }

                    await loadAttendance();
                    alert("Attendance marked successfully!");
                  } catch {
                    alert("Unable to connect to the server.");
                  }
                }}
              >
                + Mark Attendance
              </button>
            </div>

            {attendance.length === 0 ? (
              <div className="empty">
                <h3>No attendance records found</h3>
                <p>Mark attendance to see records here.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th>CHECK IN</th>
                      <th>CHECK OUT</th>
                      <th>WORKING HOURS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance
                      .filter((record) => record.employee.employmentStatus === "ACTIVE")
                      .map((record) => (
                        <tr key={record.id}>
                          <td>
                            {record.employee.firstName}{" "}
                            {record.employee.lastName}
                          </td>
                          <td>{record.attendanceDate}</td>
                          <td>
                            <span className="status">
                              {record.status}
                            </span>
                          </td>
                          <td>
                            {record.checkIn
                              ? new Date(record.checkIn).toLocaleTimeString()
                              : "—"}
                          </td>
                          <td>
                            {record.checkOut
                              ? new Date(record.checkOut).toLocaleTimeString()
                              : "—"}
                          </td>
                          <td>
                            {record.checkIn && record.checkOut
                              ? (() => {
                                  const totalMinutes = Math.floor(
                                    (new Date(record.checkOut).getTime() -
                                      new Date(record.checkIn).getTime()) / 60000
                                  );

                                  const hours = Math.floor(totalMinutes / 60);
                                  const minutes = totalMinutes % 60;

                                  return `${hours}h ${minutes}m`;
                                })()
                              : "In Progress"}
                          </td>
                          <td>
                            {record.status === "PRESENT" &&
                              record.checkIn &&
                              !record.checkOut && (
                                <button
                                  className="action-btn"
                                  onClick={() => checkOut(record.id)}
                                >
                                  Check Out
                                </button>
                              )}

                            {record.checkOut && (
                              <span className="status">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {selectedPage === "Leave Management" && (
          <section className="directory">
            <div className="section-header">
              <div>
                <h2>Leave Management</h2>
                <p>Review and manage employee leave applications.</p>
              </div>

              <button className="secondary-btn" onClick={loadLeaves}>
                ↻ Refresh
              </button>
            </div>

            <div className="attendance-actions">
              <select
                value={leaveFilter}
                onChange={(e) => setLeaveFilter(e.target.value)}
              >
                <option value="ALL">All applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {leaves.filter(
              (leave) =>
                leaveFilter === "ALL" || leave.status === leaveFilter
            ).length === 0 ? (
              <div className="empty">
                <h3>No leave applications found</h3>
                <p>There are no applications in this category.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>LEAVE TYPE</th>
                      <th>DATES</th>
                      <th>DAYS</th>
                      <th>REASON</th>
                      <th>STATUS</th>
                      <th>REVIEWED BY</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaves
                      .filter(
                        (leave) =>
                          leaveFilter === "ALL" ||
                          leave.status === leaveFilter
                      )
                      .map((leave) => (
                        <tr key={leave.id}>
                          <td>
                            {leave.employee.firstName}{" "}
                            {leave.employee.lastName}
                            <span className="subtext">
                              {leave.employee.employeeCode}
                            </span>
                          </td>

                          <td>{leave.leaveType}</td>

                          <td>
                            {leave.startDate} – {leave.endDate}
                          </td>

                          <td>{leave.totalDays}</td>

                          <td>{leave.reason}</td>

                          <td>
                            <span className="status">
                              {leave.status}
                            </span>
                          </td>

                          <td>{leave.reviewedBy || "—"}</td>

                          <td>
                            {leave.status === "PENDING" ? (
                              <>
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    updateLeaveStatus(leave.id, "APPROVED")
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  className="delete-btn"
                                  onClick={() =>
                                    updateLeaveStatus(leave.id, "REJECTED")
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {selectedPage === "Payroll" && (
          <Payroll authHeader={authHeader} />
        )}

        {selectedPage === "Performance" && (
          <Performance
            authHeader={authHeader}
            employees={employees}
          />
        )}

        {selectedPage === "Onboarding" && (
          <Onboarding
            authHeader={authHeader}
            employees={employees}
          />
        )}

        {showForm && (
          <div className="modal-overlay">
            <form className="employee-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <div>
                  <h2>{editingId ? "Edit Employee" : "Add Employee"}</h2>
                  <p>Enter the employee's information below.</p>
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
                  Employee Code
                  <input name="employeeCode" value={form.employeeCode} onChange={handleChange} required />
                </label>
                <label>
                  First Name
                  <input name="firstName" value={form.firstName} onChange={handleChange} required />
                </label>
                <label>
                  Last Name
                  <input name="lastName" value={form.lastName} onChange={handleChange} required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                  Phone
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>
                  Department
                  <input name="department" value={form.department} onChange={handleChange} />
                </label>
                <label>
                  Designation
                  <input name="designation" value={form.designation} onChange={handleChange} />
                </label>
                <label>
                  Joining Date
                  <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />
                </label>
                <label>
                  Employment Status
                  <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
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
                  {editingId ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
