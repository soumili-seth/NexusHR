
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  employmentStatus: string;
  department: string;
}

interface Attendance {
  id: number;
  attendanceDate: string;
  status: string;
}

interface Leave {
  id: number;
  status: string;
}

interface Payroll {
  id: number;
  netSalary: number;
  paymentStatus: string;
  createdAt: string;
  employeeName: string;
  salaryMonth: string;
}

interface Performance {
  id: number;
  rating: number;
  reviewDate: string;
  reviewPeriod: string;
  createdAt?: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface Onboarding {
  id: number;
  onboardingStatus: string;
  createdAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface DashboardProps {
  authHeader: string;
  employees: Employee[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface ChartBarProps {
  label: string;
  value: number;
  total: number;
}

const API = "http://localhost:8080/api";

function ChartBar({ label, value, total }: ChartBarProps) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="dashboard-chart-row">
      <div className="dashboard-chart-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="dashboard-chart-track">
        <div
          className="dashboard-chart-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <small>{percentage}%</small>
    </div>
  );
}

function Dashboard({ authHeader, employees }: DashboardProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [reviews, setReviews] = useState<Performance[]>([]);
  const [onboarding, setOnboarding] = useState<Onboarding[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Stores the date and time of the latest dashboard refresh
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setErrors([]);

    const endpoints = [
      { name: "Attendance", url: `${API}/attendance`, setter: setAttendance },
      { name: "Leave", url: `${API}/leaves`, setter: setLeaves },
      { name: "Payroll", url: `${API}/payroll`, setter: setPayrolls },
      { name: "Performance", url: `${API}/performance`, setter: setReviews },
      { name: "Onboarding", url: `${API}/onboarding`, setter: setOnboarding },
    ];

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const response = await fetch(endpoint.url, {
          headers: { Authorization: authHeader },
        });

        if (!response.ok) {
          throw new Error(endpoint.name);
        }

        return {
          name: endpoint.name,
          data: await response.json(),
          setter: endpoint.setter,
        };
      })
    );

    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        result.value.setter(result.value.data);
      } else {
        failed.push(endpoints[index].name);
      }
    });

    setErrors(failed);
    setLastRefreshed(new Date());
    setLoading(false);
  }

  useEffect(() => {
    if (authHeader) {
      loadDashboard();
    }
  }, [authHeader]);

  // Today's date in local time
  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  })();

  // Attendance calculations
  const todayAttendance = attendance.filter(
    (record) => record.attendanceDate === today
  );

  const presentToday = todayAttendance.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const absentToday = todayAttendance.filter(
    (record) => record.status === "ABSENT"
  ).length;

  const leaveToday = todayAttendance.filter(
    (record) => record.status === "LEAVE"
  ).length;

  // Leave calculations
  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "PENDING"
  ).length;

  const approvedLeaves = leaves.filter(
    (leave) => leave.status === "APPROVED"
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) => leave.status === "REJECTED"
  ).length;

  // Payroll calculations
  const totalPayroll = payrolls.reduce(
    (sum, record) => sum + Number(record.netSalary || 0),
    0
  );

  const paidPayroll = payrolls.filter(
    (record) => record.paymentStatus === "PAID"
  ).length;

  const pendingPayroll = payrolls.filter(
    (record) => record.paymentStatus === "PENDING"
  ).length;

  // Performance calculations
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const employeesReviewed = new Set(
    reviews.map((review) => review.employee.id)
  ).size;

  // Onboarding calculations
  const notStarted = onboarding.filter(
    (record) => record.onboardingStatus === "NOT_STARTED"
  ).length;

  const inProgress = onboarding.filter(
    (record) => record.onboardingStatus === "IN_PROGRESS"
  ).length;

  const completed = onboarding.filter(
    (record) => record.onboardingStatus === "COMPLETED"
  ).length;

  // Workforce calculations
  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.employmentStatus === "INACTIVE"
  ).length;

  const departments = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  ).size;

  // Department-wise employee distribution
const departmentDistribution = Object.entries(
  employees.reduce<Record<string, number>>((counts, employee) => {
    const department = employee.department?.trim() || "Unassigned";

    counts[department] = (counts[department] || 0) + 1;

    return counts;
  }, {})
).map(([department, count]) => ({
  department,
  count,
}));

  // Recent activity calculations
  const recentActivities: Activity[] = [
    ...payrolls.map((record) => ({
      id: `payroll-${record.id}`,
      title: "Payroll Generated",
      description: `${record.employeeName} — ${record.salaryMonth} (${record.paymentStatus})`,
      date: record.createdAt,
    })),

    ...reviews.map((record) => ({
      id: `performance-${record.id}`,
      title: "Performance Review Recorded",
      description: `${record.employee.firstName} ${record.employee.lastName} — ${record.reviewPeriod}, Rating: ${record.rating}/5`,
      date: record.createdAt || record.reviewDate,
    })),

    ...onboarding.map((record) => ({
      id: `onboarding-${record.id}`,
      title: "Employee Onboarding Updated",
      description: `${record.employee.firstName} ${record.employee.lastName} — ${record.onboardingStatus}`,
      date: record.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 8);

  // Currency formatter
  const money = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="dashboard-page">

      {/* Dashboard Welcome */}
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">WORKFORCE INTELLIGENCE</span>
          <h2>Dashboard Overview 👋</h2>
          <p>
            Monitor your workforce, attendance, payroll and employee growth
            from one place.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="dashboard-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh Dashboard"}
          </button>

          <p className="dashboard-last-refreshed">
            Last refreshed:{" "}
            {lastRefreshed
              ? lastRefreshed.toLocaleString("en-IN")
              : "Not yet refreshed"}
          </p>
        </div>
      </section>

      {/* API Errors */}
      {errors.length > 0 && (
        <div className="error">
          Could not load: {errors.join(", ")}. Other available figures are
          still displayed. Try refreshing.
        </div>
      )}

      {/* Workforce Overview */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Workforce Overview</h2>
          <span>Employee statistics</span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Total Employees</span>
            <h3>{employees.length}</h3>
            <small>Registered employees</small>
          </div>

          <div className="dashboard-card">
            <span>Active Employees</span>
            <h3>{activeEmployees}</h3>
            <small>Currently active</small>
          </div>

          <div className="dashboard-card">
            <span>Inactive Employees</span>
            <h3>{inactiveEmployees}</h3>
            <small>Inactive workforce</small>
          </div>

          <div className="dashboard-card">
            <span>Departments</span>
            <h3>{departments}</h3>
            <small>Unique departments</small>
          </div>
        </div>
      </section>

            {/* Department-wise Employee Distribution */}
      <section className="dashboard-chart-card">
        <h3>Department-wise Employee Distribution</h3>
        <p>Number of employees in each department</p>

        {departmentDistribution.length === 0 ? (
          <p>No department data available.</p>
        ) : (
          departmentDistribution.map((item) => (
            <ChartBar
              key={item.department}
              label={item.department}
              value={item.count}
              total={employees.length}
            />
          ))
        )}
      </section>

      {/* Attendance Overview */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Attendance Overview</h2>
          <span>Today's records · {today}</span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Present Today</span>
            <h3>{presentToday}</h3>
            <small>Marked present</small>
          </div>

          <div className="dashboard-card">
            <span>Absent Today</span>
            <h3>{absentToday}</h3>
            <small>Marked absent</small>
          </div>

          <div className="dashboard-card">
            <span>On Leave Today</span>
            <h3>{leaveToday}</h3>
            <small>Attendance marked as leave</small>
          </div>
        </div>
      </section>

      {/* Attendance Chart */}
      <section className="dashboard-chart-card">
        <h3>Attendance Distribution</h3>
        <p>Today's attendance breakdown</p>

        <ChartBar
          label="Present"
          value={presentToday}
          total={todayAttendance.length}
        />

        <ChartBar
          label="Absent"
          value={absentToday}
          total={todayAttendance.length}
        />

        <ChartBar
          label="On Leave"
          value={leaveToday}
          total={todayAttendance.length}
        />
      </section>

      {/* Leave Overview */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Leave Management</h2>
          <span>Application summary</span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Total Applications</span>
            <h3>{leaves.length}</h3>
            <small>All leave requests</small>
          </div>

          <div className="dashboard-card">
            <span>Pending</span>
            <h3>{pendingLeaves}</h3>
            <small>Awaiting review</small>
          </div>

          <div className="dashboard-card">
            <span>Approved</span>
            <h3>{approvedLeaves}</h3>
            <small>Approved applications</small>
          </div>

          <div className="dashboard-card">
            <span>Rejected</span>
            <h3>{rejectedLeaves}</h3>
            <small>Rejected applications</small>
          </div>
        </div>
      </section>

      {/* Payroll Overview */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Payroll Overview</h2>
          <span>All recorded payroll</span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Total Net Payroll</span>
            <h3 className="dashboard-money">{money(totalPayroll)}</h3>
            <small>Combined recorded net salary</small>
          </div>

          <div className="dashboard-card">
            <span>Payroll Records</span>
            <h3>{payrolls.length}</h3>
            <small>Generated salary records</small>
          </div>

          <div className="dashboard-card">
            <span>Paid Payments</span>
            <h3>{paidPayroll}</h3>
            <small>Successfully paid</small>
          </div>

          <div className="dashboard-card">
            <span>Pending Payments</span>
            <h3>{pendingPayroll}</h3>
            <small>Awaiting payment</small>
          </div>
        </div>
      </section>

      {/* Payroll Chart */}
      <section className="dashboard-chart-card">
        <h3>Payroll Payment Distribution</h3>
        <p>Payment status across all payroll records</p>

        <ChartBar
          label="Paid"
          value={paidPayroll}
          total={payrolls.length}
        />

        <ChartBar
          label="Pending"
          value={pendingPayroll}
          total={payrolls.length}
        />
      </section>

      {/* Performance Overview */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Performance Overview</h2>
          <span>Employee evaluations</span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Total Reviews</span>
            <h3>{reviews.length}</h3>
            <small>Recorded evaluations</small>
          </div>

          <div className="dashboard-card">
            <span>Average Rating</span>
            <h3>{averageRating}/5</h3>
            <small>Overall review rating</small>
          </div>

          <div className="dashboard-card">
            <span>Employees Reviewed</span>
            <h3>{employeesReviewed}</h3>
            <small>Unique employees reviewed</small>
          </div>
        </div>
      </section>

      {/* Onboarding Overview */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Onboarding Overview</h2>
          <span>New employee progress</span>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Total Onboarding</span>
            <h3>{onboarding.length}</h3>
            <small>Registered records</small>
          </div>

          <div className="dashboard-card">
            <span>Not Started</span>
            <h3>{notStarted}</h3>
            <small>Awaiting onboarding</small>
          </div>

          <div className="dashboard-card">
            <span>In Progress</span>
            <h3>{inProgress}</h3>
            <small>Activities underway</small>
          </div>

          <div className="dashboard-card">
            <span>Completed</span>
            <h3>{completed}</h3>
            <small>Successfully onboarded</small>
          </div>
        </div>
      </section>

      {/* Onboarding Chart */}
      <section className="dashboard-chart-card">
        <h3>Onboarding Progress Distribution</h3>
        <p>Progress of employee onboarding records</p>

        <ChartBar
          label="Not Started"
          value={notStarted}
          total={onboarding.length}
        />

        <ChartBar
          label="In Progress"
          value={inProgress}
          total={onboarding.length}
        />

        <ChartBar
          label="Completed"
          value={completed}
          total={onboarding.length}
        />
      </section>

      {/* Recent Activity */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Recent Activity</h2>
          <span>Latest 8 records</span>
        </div>

        <div className="dashboard-activity-list">
          {recentActivities.length === 0 ? (
            <p>No recent activities available.</p>
          ) : (
            recentActivities.map((activity) => (
              <div
                className="dashboard-activity-item"
                key={activity.id}
              >
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.description}</p>
                </div>

                <small>
                  {activity.date
                    ? new Date(activity.date).toLocaleDateString("en-IN")
                    : "Date unavailable"}
                </small>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
