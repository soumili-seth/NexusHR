
package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.Onboarding;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.OnboardingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OnboardingService {

    private final OnboardingRepository onboardingRepository;
    private final EmployeeRepository employeeRepository;

    public OnboardingService(
            OnboardingRepository onboardingRepository,
            EmployeeRepository employeeRepository) {
        this.onboardingRepository = onboardingRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Onboarding> getAllOnboardingRecords() {
        return onboardingRepository.findAll();
    }

    public Onboarding getByEmployeeId(Long employeeId) {
        return onboardingRepository.findByEmployeeId(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Onboarding record not found"));
    }

    public Onboarding createOnboarding(
            Long employeeId,
            String hrRepresentative,
            LocalDate startDate) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found"));

        if (onboardingRepository.existsByEmployeeId(employeeId)) {
            throw new IllegalArgumentException(
                    "Onboarding record already exists for this employee");
        }

        Onboarding onboarding = new Onboarding();
        onboarding.setEmployee(employee);
        onboarding.setOnboardingStatus("NOT_STARTED");
        onboarding.setHrRepresentative(hrRepresentative);
        onboarding.setStartDate(
                startDate != null ? startDate : LocalDate.now());

        return onboardingRepository.save(onboarding);
    }

    public Onboarding updateOnboarding(
            Long id,
            String onboardingStatus,
            Boolean documentsVerified,
            Boolean equipmentAllocated,
            Boolean orientationCompleted,
            String hrRepresentative) {

        Onboarding onboarding = onboardingRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Onboarding record not found"));

        if (onboardingStatus != null) {
            if (!List.of("NOT_STARTED", "IN_PROGRESS", "COMPLETED")
                    .contains(onboardingStatus)) {
                throw new IllegalArgumentException(
                        "Invalid onboarding status");
            }
            onboarding.setOnboardingStatus(onboardingStatus);
        }

        if (documentsVerified != null) {
            onboarding.setDocumentsVerified(documentsVerified);
        }

        if (equipmentAllocated != null) {
            onboarding.setEquipmentAllocated(equipmentAllocated);
        }

        if (orientationCompleted != null) {
            onboarding.setOrientationCompleted(orientationCompleted);
        }

        if (hrRepresentative != null) {
            onboarding.setHrRepresentative(hrRepresentative);
        }

        if ("COMPLETED".equals(onboarding.getOnboardingStatus())) {
            if (!onboarding.isDocumentsVerified()
                    || !onboarding.isEquipmentAllocated()
                    || !onboarding.isOrientationCompleted()) {
                throw new IllegalArgumentException(
                        "Complete document verification, equipment allocation "
                        + "and orientation before completing onboarding");
            }
            onboarding.setCompletionDate(LocalDate.now());
        } else {
            onboarding.setCompletionDate(null);
        }

        return onboardingRepository.save(onboarding);
    }

    public void deleteOnboarding(Long id) {
        if (!onboardingRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Onboarding record not found");
        }

        onboardingRepository.deleteById(id);
    }
}
