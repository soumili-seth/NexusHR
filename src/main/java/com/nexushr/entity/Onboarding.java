
package com.nexushr.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding")
public class Onboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(nullable = false)
    private String onboardingStatus = "NOT_STARTED";

    private boolean documentsVerified;

    private boolean equipmentAllocated;

    private boolean orientationCompleted;

    private String hrRepresentative;

    private LocalDate startDate;

    private LocalDate completionDate;

    private LocalDateTime createdAt;

    public Onboarding() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getOnboardingStatus() {
        return onboardingStatus;
    }

    public void setOnboardingStatus(String onboardingStatus) {
        this.onboardingStatus = onboardingStatus;
    }

    public boolean isDocumentsVerified() {
        return documentsVerified;
    }

    public void setDocumentsVerified(boolean documentsVerified) {
        this.documentsVerified = documentsVerified;
    }

    public boolean isEquipmentAllocated() {
        return equipmentAllocated;
    }

    public void setEquipmentAllocated(boolean equipmentAllocated) {
        this.equipmentAllocated = equipmentAllocated;
    }

    public boolean isOrientationCompleted() {
        return orientationCompleted;
    }

    public void setOrientationCompleted(boolean orientationCompleted) {
        this.orientationCompleted = orientationCompleted;
    }

    public String getHrRepresentative() {
        return hrRepresentative;
    }

    public void setHrRepresentative(String hrRepresentative) {
        this.hrRepresentative = hrRepresentative;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
