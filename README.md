# NexusHR – AI-Enabled Enterprise HR & Workforce Intelligence Platform

NexusHR is a full-stack Human Resource Management System designed to centralize employee information and streamline essential HR operations through a unified dashboard.

The platform provides employee management, attendance tracking, leave management, payroll processing, performance reviews, employee onboarding, and preliminary rule-based attrition risk analysis.

## 1. Key Features

### Employee Management
- View and manage employee records.
- Maintain employee codes, departments, designations, and employment status.

### Attendance Management
- Record and view employee attendance.
- Track attendance dates and attendance statuses.

### Leave Management
- Submit and manage employee leave records.
- Track pending and reviewed leave applications.

### Payroll Management
- Generate payroll records.
- Track salary information and payment status.

### Performance Management
- Create and view employee performance reviews.
- Track ratings, review periods, feedback, and goals.

### Employee Onboarding
- Manage employee onboarding records and checklist progress.
- Update onboarding status and completion dates.

### Dashboard and Analytics
- Workforce overview and department-wise employee distribution.
- Attendance, leave, payroll, performance, and onboarding summaries.
- Recent activity and data refresh information.

### Attrition Risk Analysis
- Analyses attendance, leave applications, performance ratings, and employee tenure.
- Displays preliminary risk scores, risk levels, and contributing factors.
- Uses a rule-based scoring approach, not a trained machine-learning model.

## 2. Technology Stack

| Category | Technologies |
|---|---|
| Backend | Java 21, Spring Boot |
| Frontend | React 19, TypeScript, Vite |
| Database | PostgreSQL |
| Persistence | Spring Data JPA, Hibernate |
| Security | Spring Security, JWT, BCrypt |
| Build Tools | Maven, npm |
| Version Control | Git, GitHub |
| CI/CD | GitHub Actions |

## 3. Project Structure

```text
NexusHR/
├── src/
│   ├── main/
│   │   ├── java/com/nexushr/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   ├── dto/
│   │   │   ├── config/
│   │   │   └── security/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
├── .github/
│   └── workflows/
│       └── ci.yml
├── pom.xml
└── README.md
```

## 4. Prerequisites

Install the following tools:

- Java Development Kit (JDK) 21
- PostgreSQL
- Node.js and npm
- Git

## 5. Database Configuration

1. Start the PostgreSQL service.
2. Open pgAdmin or your preferred PostgreSQL client.
3. Create a database named `nexushr_db`.
4. Configure the database credentials using environment variables.

The application uses the following database configuration:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/nexushr_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}

spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Set the database password in PowerShell:

```powershell
$env:DB_PASSWORD = Read-Host "Enter PostgreSQL password"
```

Do not commit database passwords or other credentials to GitHub.

## 6. Backend Setup

Open PowerShell in the project root directory.

Configure the application credentials:

```powershell
$env:NEXUS_ADMIN_PASSWORD = Read-Host "Enter admin password"
$env:NEXUS_HR_PASSWORD = Read-Host "Enter HR password"
$env:JWT_SECRET = Read-Host "Enter Base64-encoded JWT secret"
```

The JWT secret must be Base64-encoded and contain at least 32 decoded bytes.

Run the backend:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend base URL:

`http://localhost:8080`

## 7. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

If that port is occupied, Vite may select another available port.

## 8. Authentication and Authorization

NexusHR uses Spring Security with JWT-based authentication.

Security implementation includes:

- User authentication through the login API.
- JWT token generation and validation.
- BCrypt password encoding.
- Role-based authorization for ADMIN and HR users.
- Stateless session management.
- Bearer token authentication for protected API requests.

### Configured user roles

| Username | Role |
|---|---|
| admin@nexushr.com | ADMIN |
| hr@nexushr.com | HR |

Passwords are supplied through environment variables and are not stored as plaintext in the source code.

### Login API

`POST /api/auth/login`

Example request:

```json
{
  "email": "admin@nexushr.com",
  "password": "your-admin-password"
}
```

A successful login returns a JWT access token and user role information.

Protected API requests use the following authorization header:

`Authorization: Bearer <JWT_TOKEN>`

Administrative authorization is required for selected delete operations, including onboarding and performance records.

## 9. Attrition Risk Analysis

The current attrition analysis uses rule-based business logic based on:

- Employee absenteeism.
- Pending leave applications.
- Latest performance rating.
- Employee tenure.

The service assigns a score between 0 and 100 and classifies employees into LOW, MEDIUM, or HIGH risk categories.

These indicators are intended for demonstration and preliminary HR analysis. They are not validated predictions of employee resignation and should not be used as the sole basis for employment decisions.

## 10. Testing and Build Verification

### Backend verification

Run from the project root:

```powershell
.\mvnw.cmd clean verify
```

The local backend verification completed successfully with:

- 1 test executed.
- 0 failures.
- 0 errors.
- Spring Boot application context loaded successfully.
- Executable Spring Boot JAR generated.

### Frontend production build

Run from the frontend directory:

```powershell
npm run build
```

The frontend TypeScript checks and Vite production build completed successfully.

## 11. Continuous Integration

NexusHR includes a GitHub Actions workflow:

`.github/workflows/ci.yml`

The workflow is triggered by:

- Pushes to the `main` branch.
- Pull requests targeting the `main` branch.

It contains two independent jobs:

**Backend Build**
- Checks out the repository.
- Sets up Java 21.
- Uses Maven dependency caching.
- Packages the Spring Boot backend.

**Frontend Build**
- Checks out the repository.
- Sets up Node.js 22.
- Installs dependencies using `npm ci`.
- Runs the Vite production build.

The current automated backend CI job uses `-DskipTests`; local Maven verification is performed separately.

## 12. Future Enhancements

Potential improvements include:

- Machine-learning-based attrition analysis using suitable validated datasets.
- Real-time notifications.
- Redis-based caching.
- Expanded automated API and integration test coverage.
- Docker-based deployment and cloud hosting.
- Monitoring and performance analytics.
- Additional scalability and performance improvements.

## 13. Project Purpose and Learning Outcomes

NexusHR demonstrates the development of a full-stack HR management application using Java, Spring Boot, React, TypeScript, and PostgreSQL.

The project brings multiple HR workflows together through a centralized platform and demonstrates practical implementation of:

- Full-stack application development.
- REST API integration.
- Relational database management.
- Authentication and role-based authorization.
- Frontend and backend integration.
- Build verification and continuous integration.

The platform provides a foundation for further enterprise-oriented development and enhancement.