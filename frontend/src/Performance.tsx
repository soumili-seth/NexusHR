
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  employmentStatus: string;
}

interface PerformanceReview {
  id: number;
  employee: Employee;
  reviewPeriod: string;
  rating: number;
  feedback: string;
  goals: string;
  reviewDate: string;
  createdAt?: string;
}

interface Props {
  authHeader: string;
  employees: Employee[];
}

const API = "http://localhost:8080/api/performance";

function Performance({ authHeader, employees }: Props) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [reviewPeriod, setReviewPeriod] = useState("Q4-2026");
  const [rating, setRating] = useState("4");
  const [feedback, setFeedback] = useState("");
  const [goals, setGoals] = useState("");
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      setLoading(true);

      const response = await fetch(API, {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Could not load performance reviews.");
      }

      setReviews(await response.json());
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [authHeader]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!employeeId) {
      alert("Please select an employee.");
      return;
    }

    try {
      const params = new URLSearchParams({
        employeeId,
        reviewPeriod,
        rating,
        feedback,
        goals,
        reviewDate,
      });

      const response = await fetch(`${API}?${params.toString()}`, {
        method: "POST",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not save performance review.");
      }

      alert("Performance review saved successfully!");

      setFeedback("");
      setGoals("");
      setRating("4");
      setReviewPeriod("Q4-2026");

      await loadReviews();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to save performance review."
      );
    }
  }

  async function deleteReview(id: number) {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        throw new Error("Could not delete performance review.");
      }

      await loadReviews();
      alert("Performance review deleted successfully!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete review."
      );
    }
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="directory">
      <div className="section-header">
        <div>
          <h2>Performance Management</h2>
          <p>Evaluate employee performance, ratings and development goals.</p>
        </div>

        <button className="secondary-btn" onClick={loadReviews}>
          ↻ Refresh
        </button>
      </div>

      <section className="stats">
        <div className="stat-card">
          <span>Total Reviews</span>
          <h2>{reviews.length}</h2>
          <small>Recorded reviews</small>
        </div>

        <div className="stat-card">
          <span>Average Rating</span>
          <h2>{averageRating}/5</h2>
          <small>Overall performance</small>
        </div>

        <div className="stat-card">
          <span>Employees Reviewed</span>
          <h2>
            {new Set(reviews.map((review) => review.employee.id)).size}
          </h2>
          <small>Unique employees</small>
        </div>
      </section>

      <section className="directory">
        <div className="section-header">
          <div>
            <h2>Create Performance Review</h2>
            <p>Enter the employee's evaluation details.</p>
          </div>
        </div>

        <form className="employee-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Employee
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              >
                <option value="">Select Employee</option>
                {employees
                  .filter((emp) => emp.employmentStatus === "ACTIVE")
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Review Period
              <input
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                placeholder="e.g. Q4-2026"
                required
              />
            </label>

            <label>
              Performance Rating
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="1">1 - Poor</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="3">3 - Meets Expectations</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </label>

            <label>
              Review Date
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                required
              />
            </label>

            <label>
              Feedback
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter performance feedback"
                required
              />
            </label>

            <label>
              Development Goals
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Enter future goals and improvements"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              + Save Performance Review
            </button>
          </div>
        </form>
      </section>

      <section className="directory">
        <div className="section-header">
          <div>
            <h2>Performance Review Records</h2>
            <p>View and manage employee evaluations.</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <p className="message">Loading performance reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="empty">
            <h3>No performance reviews found</h3>
            <p>Create your first employee performance review.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT</th>
                  <th>REVIEW PERIOD</th>
                  <th>RATING</th>
                  <th>FEEDBACK</th>
                  <th>GOALS</th>
                  <th>REVIEW DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <strong>
                        {review.employee.firstName}{" "}
                        {review.employee.lastName}
                      </strong>
                      <span className="subtext">
                        {review.employee.employeeCode}
                      </span>
                    </td>

                    <td>{review.employee.department}</td>
                    <td>{review.reviewPeriod}</td>
                    <td>
                      <span className="status">
                        {review.rating}/5
                      </span>
                    </td>
                    <td>{review.feedback || "—"}</td>
                    <td>{review.goals || "—"}</td>
                    <td>{review.reviewDate}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteReview(review.id)}
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
    </section>
  );
}

export default Performance;
