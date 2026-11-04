
package com.nexushr.controller;

import com.nexushr.entity.Attendance;
import com.nexushr.service.AttendanceService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/date/{date}")
    public List<Attendance> getAttendanceByDate(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return attendanceService.getAttendanceByDate(date);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getAttendanceByEmployee(
            @PathVariable Long employeeId) {
        return attendanceService.getAttendanceByEmployee(employeeId);
    }

    @PostMapping("/mark/{employeeId}")
    public Attendance markAttendance(
            @PathVariable Long employeeId,
            @RequestParam String status) {
        return attendanceService.markAttendance(employeeId, status);
    }

    @PutMapping("/checkout/{attendanceId}")
    public Attendance checkOut(@PathVariable Long attendanceId) {
        return attendanceService.checkOut(attendanceId);
    }
}
