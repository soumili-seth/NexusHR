package com.nexushr.controller;

import com.nexushr.entity.Leave;
import com.nexushr.service.LeaveService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // Get all leave applications
    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

    // Get leaves by employee
    @GetMapping("/employee/{employeeId}")
    public List<Leave> getLeavesByEmployee(
            @PathVariable Long employeeId) {
        return leaveService.getLeavesByEmployee(employeeId);
    }

    // Get leaves by status
    @GetMapping("/status/{status}")
    public List<Leave> getLeavesByStatus(
            @PathVariable String status) {
        return leaveService.getLeavesByStatus(status);
    }

    // Apply for leave
    @PostMapping("/apply/{employeeId}")
    public Leave applyLeave(
            @PathVariable Long employeeId,
            @RequestBody Leave leave) {
        return leaveService.applyLeave(employeeId, leave);
    }

    // Approve or reject leave
    @PatchMapping("/{leaveId}/status")
public Leave updateLeaveStatus(
        @PathVariable Long leaveId,
        @RequestParam String status,
        org.springframework.security.core.Authentication authentication) {

    String reviewedBy = authentication.getName();

    return leaveService.updateLeaveStatus(
            leaveId, status, reviewedBy);
}
}