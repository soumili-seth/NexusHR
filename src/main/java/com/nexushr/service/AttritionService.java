
package com.nexushr.service;

import com.nexushr.dto.AttritionRiskResponse;
import com.nexushr.entity.*;
import com.nexushr.repository.*;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AttritionService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PerformanceRepository performanceRepository;

    public AttritionService(
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            LeaveRepository leaveRepository,
            PerformanceRepository performanceRepository) {

        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.performanceRepository = performanceRepository;
    }

    public List<AttritionRiskResponse> analyzeAllEmployees() {

        List<AttritionRiskResponse> results = new ArrayList<>();

        List<Employee> employees = employeeRepository.findAll();

        for (Employee employee : employees) {

            if (!"ACTIVE".equalsIgnoreCase(employee.getEmploymentStatus())) {
                continue;
            }

            results.add(analyzeEmployee(employee));
        }

        return results;
    }

    private AttritionRiskResponse analyzeEmployee(Employee employee) {

        int riskScore = 0;

        List<String> riskFactors = new ArrayList<>();

        Long employeeId = employee.getId();

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        // 1. Attendance analysis (last 30 days)

        List<Attendance> attendanceRecords =
                attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(
                        employeeId,
                        thirtyDaysAgo,
                        today
                );

        long absentDays = attendanceRecords.stream()
                .filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus()))
                .count();

        if (absentDays >= 5) {
            riskScore += 30;
            riskFactors.add("High absenteeism in the last 30 days");
        } else if (absentDays >= 3) {
            riskScore += 15;
            riskFactors.add("Moderate absenteeism in the last 30 days");
        }

        // 2. Leave analysis (last 30 days)

        List<Leave> leaveRecords =
                leaveRepository.findByEmployeeIdAndAppliedDateAfter(
                        employeeId,
                        today.minusDays(30).atStartOfDay()
                );

        long pendingLeaves = leaveRecords.stream()
                .filter(l -> "PENDING".equalsIgnoreCase(l.getStatus()))
                .count();

        if (pendingLeaves >= 3) {
            riskScore += 15;
            riskFactors.add("Multiple pending leave applications");
        }

        // 3. Performance analysis

        List<Performance> reviews =
                performanceRepository.findByEmployeeIdOrderByReviewDateDesc(
                        employeeId
                );

        if (!reviews.isEmpty()) {

            Integer rating = reviews.get(0).getRating();

            if (rating != null && rating <= 2) {
                riskScore += 30;
                riskFactors.add("Low latest performance rating");
            } else if (rating != null && rating == 3) {
                riskScore += 10;
                riskFactors.add("Average latest performance rating");
            }

        } else {
            riskFactors.add("No performance review available");
        }

        // 4. Employee tenure analysis

        if (employee.getJoiningDate() != null) {

            long monthsWorked = java.time.temporal.ChronoUnit.MONTHS.between(
                    employee.getJoiningDate(),
                    today
            );

            if (monthsWorked < 6) {
                riskScore += 10;
                riskFactors.add("Employee has less than six months of tenure");
            }
        }

        // Keep risk score between 0 and 100

        riskScore = Math.min(riskScore, 100);

        // Determine risk level

        String riskLevel;

        if (riskScore >= 60) {
            riskLevel = "HIGH";
        } else if (riskScore >= 30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        String employeeName =
                employee.getFirstName() + " " + employee.getLastName();

        return new AttritionRiskResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employeeName,
                employee.getDepartment(),
                employee.getDesignation(),
                riskScore,
                riskLevel,
                riskFactors
        );
    }
}
