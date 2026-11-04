# NexusHR – AI-Enabled Enterprise HR & Workforce Intelligence Platform

NexusHR is a web-based Human Resource Management System designed to help organizations manage employee information and core HR operations through a centralized dashboard.

The application provides employee management, attendance tracking, leave management, payroll processing, performance reviews, employee onboarding, and preliminary rule-based attrition risk indicators.

## 1. Features

### Employee Management
- View and manage employee records.
- Maintain employee codes, departments, designations, and employment status.

### Attendance Management
- Record and view employee attendance.
- Track attendance dates and statuses.

### Leave Management
- Submit and manage leave records.
- Track pending and reviewed leave applications.

### Payroll Management
- Generate payroll records.
- Track salary information and payment status.

### Performance Management
- Create and view employee performance reviews.
- Track ratings, review periods, feedback, and goals.

### Employee Onboarding
- Manage onboarding records and checklist progress.
- Update onboarding status and completion dates.

### Dashboard and Analytics
- Workforce overview and department-wise employee distribution.
- Attendance, leave, payroll, performance, and onboarding summaries.
- Recent activity and data refresh information.

### Attrition Risk Analysis
- Analyses attendance, leave applications, performance ratings, and employee tenure.
- Displays a preliminary risk score, risk level, and contributing factors.
- Uses a rule-based scoring approach. It is not a trained machine-learning model or a validated prediction of employee resignation.

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot |
| Frontend | React 19, TypeScript, Vite |
| Database | PostgreSQL 18 |
| Persistence | Spring Data JPA, Hibernate |
| Security | Spring Security, BCrypt, HTTP Basic Authentication |
| Build tools | Maven, npm |

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
│   │   │   └── config/
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

Install the following before running the application:

- Java Development Kit (JDK) 21
- PostgreSQL
- Node.js and npm
- Git

## 5. Database Configuration

1. Start PostgreSQL.
2. Open pgAdmin.
3. Create a database named `nexushr_db`.
4. Configure the database connection in `src/main/resources/application.properties`.

The application uses environment variables for database credentials:

```properties
spring.application.name=nexushr

spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/nexushr_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}

spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Set the database password in your local PowerShell session:

```powershell
$securePassword = Read-Host "Enter PostgreSQL password" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
```

Do not commit actual passwords or credentials to GitHub.

## 6. Backend Setup

From the project root directory, configure the authentication credentials in PowerShell:

```powershell
$env:NEXUS_ADMIN_PASSWORD = "your-admin-password"
$env:NEXUS_HR_PASSWORD = "your-hr-password"
```

Replace the example values with strong local passwords.

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

If that port is already occupied, Vite may use another port, such as 5174.

## 8. Authentication and Authorization

The application uses Spring Security with HTTP Basic Authentication and BCrypt password encoding.

Configured users:

| Username | Role |
|---|---|
| admin@nexushr.com | ADMIN |
| hr@nexushr.com | HR |

Both accounts require passwords supplied through environment variables.

Administrative authorization is required for selected delete operations, including onboarding and performance records.

**Note:** The current implementation uses HTTP Basic Authentication. JWT-based authentication is not implemented.

## 9. Attrition Risk Calculation

The current attrition analysis uses configurable business rules based on:

- Recent employee absenteeism.
- Multiple pending leave applications.
- Latest performance rating.
- Employee tenure.

The service assigns a score between 0 and 100 and classifies employees as LOW, MEDIUM, or HIGH risk.

These indicators are intended for demonstration and preliminary HR analysis. They should not be treated as validated employee attrition predictions or used as the sole basis for employment decisions.

## 10. Testing and Build Verification

Backend verification:

```powershell
.\mvnw.cmd clean verify
```

Frontend production build:

```powershell
cd frontend
npm run build
```

The backend verification completed successfully with:

- 1 test executed.
- 0 failures.
- 0 errors.
- Executable Spring Boot JAR generated.

The frontend production build also completed successfully.

## 11. Continuous Integration

A GitHub Actions workflow is configured under:

`.github/workflows/ci.yml`

It performs backend packaging and frontend dependency installation and production build checks.

## 12. Future Enhancements

Potential improvements include:

- JWT-based authentication.
- Machine-learning-based attrition prediction using suitable validated data.
- Real-time notifications.
- Redis-based caching.
- Automated API and integration test coverage.
- Docker-based deployment and cloud hosting.
- Monitoring and performance analytics.

## 13. Project Purpose

NexusHR demonstrates the development of a full-stack HR management application using Java, Spring Boot, React, TypeScript, and PostgreSQL. It brings multiple HR workflows together and provides a foundation for further enterprise-level enhancements.