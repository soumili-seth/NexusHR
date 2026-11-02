
package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {

    Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    employee.setEmployeeCode(updatedEmployee.getEmployeeCode());
    employee.setFirstName(updatedEmployee.getFirstName());
    employee.setLastName(updatedEmployee.getLastName());
    employee.setEmail(updatedEmployee.getEmail());
    employee.setPhone(updatedEmployee.getPhone());
    employee.setDepartment(updatedEmployee.getDepartment());
    employee.setDesignation(updatedEmployee.getDesignation());
    employee.setJoiningDate(updatedEmployee.getJoiningDate());
    employee.setEmploymentStatus(updatedEmployee.getEmploymentStatus());

    return employeeRepository.save(employee);
}

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
