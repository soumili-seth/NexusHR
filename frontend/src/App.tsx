
import { useEffect, useState } from "react";
import "./App.css";

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

const API = "http://localhost:8080/api/employees";

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load employees");
      const data = await response.json();
      setEmployees(data);
      setError("");
    } catch {
      setError("Cannot connect to the backend. Check that Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save employee. Check the details.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadEmployees();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function deleteEmployee(id: number) {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete employee");
      await loadEmployees();
    } catch {
      alert("Could not delete employee.");
    }
  }

  const activeCount = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE"
  ).length;

  const departments = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  ).size;

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
        <div className="nav-item selected">▦ &nbsp; Dashboard</div>
        <div className="nav-item">♙ &nbsp; Employees</div>
        <div className="nav-item">◷ &nbsp; Attendance</div>
        <div className="nav-item">▤ &nbsp; Leave Management</div>
        <div className="nav-item">▧ &nbsp; Payroll</div>
        <div className="nav-item">◈ &nbsp; Performance</div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">HR</div>
          <div>
            <strong>HR Administrator</strong>
            <span>System Admin</span>
          </div>
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
            <button className="secondary-btn" onClick={loadEmployees}>
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
                        <button
                          className="delete-btn"
                          onClick={() => deleteEmployee(employee.id)}
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
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
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
