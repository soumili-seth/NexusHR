
package com.nexushr.dto;

import java.util.List;

public class AttritionRiskResponse {

    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String department;
    private String designation;
    private int riskScore;
    private String riskLevel;
    private List<String> riskFactors;

    public AttritionRiskResponse(
            Long employeeId,
            String employeeCode,
            String employeeName,
            String department,
            String designation,
            int riskScore,
            String riskLevel,
            List<String> riskFactors) {

        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.employeeName = employeeName;
        this.department = department;
        this.designation = designation;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.riskFactors = riskFactors;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public String getDesignation() {
        return designation;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }
}
