
package com.nexushr.controller;

import com.nexushr.dto.PayrollResponse;
import com.nexushr.service.PayrollService;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "http://localhost:5173")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public List<PayrollResponse> getAllPayrolls() {
        return payrollService.getAllPayrolls();
    }

    @GetMapping("/employee/{employeeId}")
    public List<PayrollResponse> getPayrollByEmployee(
            @PathVariable Long employeeId) {
        return payrollService.getPayrollByEmployee(employeeId);
    }

    @PostMapping("/generate/{employeeId}")
    public PayrollResponse createPayroll(
            @PathVariable Long employeeId,
            @RequestParam String salaryMonth,
            @RequestParam BigDecimal basicSalary,
            @RequestParam BigDecimal allowances,
            @RequestParam BigDecimal deductions) {

        return payrollService.createPayroll(
                employeeId,
                salaryMonth,
                basicSalary,
                allowances,
                deductions);
    }

    @PatchMapping("/{payrollId}/status")
    public PayrollResponse updatePaymentStatus(
            @PathVariable Long payrollId,
            @RequestParam String status) {

        return payrollService.updatePaymentStatus(
                payrollId, status);
    }
}
