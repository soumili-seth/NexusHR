package com.nexushr.service;

import com.nexushr.entity.Leave;
import com.nexushr.entity.Employee;
import com.nexushr.repository.LeaveRepository;
import com.nexushr.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    // Get all leave applications
    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    // Get leaves of a particular employee
    public List<Leave> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    // Get leaves by status
    public List<Leave> getLeavesByStatus(String status) {
        return leaveRepository.findByStatus(status.toUpperCase());
    }

    // Apply for leave
    public Leave applyLeave(Long employeeId, Leave leave) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        if (!"ACTIVE".equalsIgnoreCase(employee.getEmploymentStatus())) {
            throw new IllegalArgumentException(
                    "Inactive employees cannot apply for leave.");
        }

        if (leave.getLeaveType() == null ||
                !List.of("CASUAL", "SICK", "EARNED")
                        .contains(leave.getLeaveType().toUpperCase())) {
            throw new IllegalArgumentException("Invalid leave type.");
        }

        if (leave.getStartDate() == null || leave.getEndDate() == null) {
            throw new IllegalArgumentException("Leave dates are required.");
        }

        if (leave.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Leave cannot be applied for past dates.");
        }

        if (leave.getEndDate().isBefore(leave.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date.");
        }

        if (leave.getReason() == null || leave.getReason().isBlank()) {
            throw new IllegalArgumentException("Leave reason is required.");
        }

        leave.setEmployee(employee);
        leave.setLeaveType(leave.getLeaveType().toUpperCase());
        leave.setTotalDays(
                (int) (leave.getEndDate().toEpochDay()
                        - leave.getStartDate().toEpochDay() + 1));

        leave.setStatus("PENDING");
        leave.setReviewedBy(null);

        return leaveRepository.save(leave);
    }

    // Approve or reject leave
    public Leave updateLeaveStatus(
            Long leaveId, String status, String reviewedBy) {

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() ->
                        new RuntimeException("Leave application not found"));

        String normalizedStatus = status.toUpperCase();

        if (!List.of("APPROVED", "REJECTED")
                .contains(normalizedStatus)) {
            throw new IllegalArgumentException(
                    "Status must be APPROVED or REJECTED.");
        }

        if (!"PENDING".equals(leave.getStatus())) {
            throw new IllegalStateException(
                    "This leave application has already been reviewed.");
        }

        leave.setStatus(normalizedStatus);
        leave.setReviewedBy(reviewedBy);

        return leaveRepository.save(leave);
    }
}