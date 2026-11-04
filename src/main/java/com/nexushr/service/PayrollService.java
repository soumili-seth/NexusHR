package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.Payroll;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PayrollRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.nexushr.dto.PayrollResponse;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public PayrollService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
    }

   public List<PayrollResponse> getAllPayrolls() {
    return payrollRepository.findAll()
            .stream()
            .map(this::toResponse)
            .toList();
}

   public List<PayrollResponse> getPayrollByEmployee(Long employeeId) {
    return payrollRepository.findByEmployeeId(employeeId)
            .stream()
            .map(this::toResponse)
            .toList();
}

    public PayrollResponse createPayroll(
            Long employeeId,
            String salaryMonth,
            BigDecimal basicSalary,
            BigDecimal allowances,
            BigDecimal deductions) {

       Employee employee = employeeRepository.findById(employeeId)
        .orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found."
                ));

        if (!"ACTIVE".equals(employee.getEmploymentStatus())) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Payroll cannot be created for an inactive employee."
    );
}

        if (salaryMonth == null ||
                !salaryMonth.matches("\\d{4}-(0[1-9]|1[0-2])")) {
            throw new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        "Salary month must use YYYY-MM format."
);
        }

        if (basicSalary == null || basicSalary.compareTo(BigDecimal.ZERO) < 0 ||
        allowances == null || allowances.compareTo(BigDecimal.ZERO) < 0 ||
        deductions == null || deductions.compareTo(BigDecimal.ZERO) < 0) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Salary amounts cannot be negative or empty."
    );
}

       if (deductions.compareTo(basicSalary.add(allowances)) > 0) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Deductions cannot exceed total earnings."
    );
}

        if (!payrollRepository.findByEmployeeId(employeeId).stream()
                .filter(p -> salaryMonth.equals(p.getSalaryMonth()))
                .toList().isEmpty()) {
           throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "Payroll already exists for this employee and month."
);
        }

        BigDecimal netSalary = basicSalary
                .add(allowances)
                .subtract(deductions);

        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setSalaryMonth(salaryMonth);
        payroll.setBasicSalary(basicSalary);
        payroll.setAllowances(allowances);
        payroll.setDeductions(deductions);
        payroll.setNetSalary(netSalary);
        payroll.setPaymentStatus("PENDING");

        return toResponse(payrollRepository.save(payroll));
    }

    public PayrollResponse updatePaymentStatus(Long payrollId, String status) {

        Payroll payroll = payrollRepository.findById(payrollId)
        .orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payroll record not found."
                ));
if (!"PAID".equals(status) && !"PENDING".equals(status)) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Payment status must be PAID or PENDING."
    );
}

        payroll.setPaymentStatus(status);

        if ("PAID".equals(status)) {
            payroll.setPaymentDate(LocalDate.now());
        } else {
            payroll.setPaymentDate(null);
        }

       return toResponse(payrollRepository.save(payroll));
    }

private PayrollResponse toResponse(Payroll payroll) {

    Employee employee = payroll.getEmployee();

    return new PayrollResponse(
            payroll.getId(),
            employee.getId(),
            employee.getEmployeeCode(),
            employee.getFirstName() + " " + employee.getLastName(),
            payroll.getSalaryMonth(),
            payroll.getBasicSalary(),
            payroll.getAllowances(),
            payroll.getDeductions(),
            payroll.getNetSalary(),
            payroll.getPaymentDate(),
            payroll.getPaymentStatus(),
            payroll.getCreatedAt()
    );
}


}