
package com.nexushr.controller;

import com.nexushr.entity.Employee;
import com.nexushr.service.EmployeeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Add a new employee
    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    // Get all employees
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // Get employee by ID
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    // Delete employee
    // Deactivate employee
@PatchMapping("/{id}/deactivate")
public Employee deactivateEmployee(@PathVariable Long id) {
    return employeeService.deactivateEmployee(id);
}
@PatchMapping("/{id}/activate")
public Employee activateEmployee(@PathVariable Long id) {
    return employeeService.activateEmployee(id);
}
    // Update employee
@PutMapping("/{id}")
public Employee updateEmployee(
        @PathVariable Long id,
        @RequestBody Employee employee) {

    return employeeService.updateEmployee(id, employee);
}
}

