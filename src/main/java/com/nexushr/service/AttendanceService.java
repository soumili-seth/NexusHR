
package com.nexushr.service;

import com.nexushr.entity.Attendance;
import com.nexushr.entity.Employee;
import com.nexushr.repository.AttendanceRepository;
import com.nexushr.repository.EmployeeRepository;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public Attendance markAttendance(Long employeeId, String status) {

    Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() ->
                    new RuntimeException("Employee not found"));

    LocalDate today = LocalDate.now();

    Attendance attendance = attendanceRepository
            .findByEmployeeIdAndAttendanceDate(employeeId, today)
            .orElseGet(() -> {
                Attendance newAttendance = new Attendance();
                newAttendance.setEmployee(employee);
                newAttendance.setAttendanceDate(today);
                return newAttendance;
            });

    String normalizedStatus = status.toUpperCase();

    if (!List.of("PRESENT", "ABSENT", "LEAVE").contains(normalizedStatus)) {
        throw new IllegalArgumentException("Invalid attendance status");
    }

    attendance.setStatus(normalizedStatus);

    if (normalizedStatus.equals("PRESENT")) {
        if (attendance.getCheckIn() == null) {
            attendance.setCheckIn(LocalDateTime.now());
        }
    } else {
        attendance.setCheckIn(null);
        attendance.setCheckOut(null);
    }

    return attendanceRepository.save(attendance);
}
   public Attendance checkOut(Long attendanceId) {

    Attendance attendance = attendanceRepository.findById(attendanceId)
            .orElseThrow(() ->
                    new RuntimeException("Attendance record not found"));

    if (!"PRESENT".equals(attendance.getStatus())) {
        throw new IllegalStateException(
                "Only employees marked PRESENT can check out.");
    }

    if (attendance.getCheckIn() == null) {
        throw new IllegalStateException(
                "Employee must check in before checking out.");
    }

    if (attendance.getCheckOut() != null) {
        throw new IllegalStateException(
                "Employee has already checked out.");
    }

    attendance.setCheckOut(LocalDateTime.now());

    return attendanceRepository.save(attendance);
}
}
