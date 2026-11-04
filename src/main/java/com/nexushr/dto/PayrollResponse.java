package com.nexushr.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PayrollResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        String salaryMonth,
        BigDecimal basicSalary,
        BigDecimal allowances,
        BigDecimal deductions,
        BigDecimal netSalary,
        LocalDate paymentDate,
        String paymentStatus,
        LocalDateTime createdAt
) {
}