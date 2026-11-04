
package com.nexushr.controller;

import com.nexushr.entity.Onboarding;
import com.nexushr.service.OnboardingService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @GetMapping
    public List<Onboarding> getAllOnboardingRecords() {
        return onboardingService.getAllOnboardingRecords();
    }

    @GetMapping("/employee/{employeeId}")
    public Onboarding getByEmployeeId(
            @PathVariable Long employeeId) {
        return onboardingService.getByEmployeeId(employeeId);
    }

    @PostMapping
    public Onboarding createOnboarding(
            @RequestParam Long employeeId,
            @RequestParam(required = false) String hrRepresentative,
            @RequestParam(required = false) LocalDate startDate) {

        return onboardingService.createOnboarding(
                employeeId,
                hrRepresentative,
                startDate
        );
    }

    @PatchMapping("/{id}")
    public Onboarding updateOnboarding(
            @PathVariable Long id,
            @RequestParam(required = false) String onboardingStatus,
            @RequestParam(required = false) Boolean documentsVerified,
            @RequestParam(required = false) Boolean equipmentAllocated,
            @RequestParam(required = false) Boolean orientationCompleted,
            @RequestParam(required = false) String hrRepresentative) {

        return onboardingService.updateOnboarding(
                id,
                onboardingStatus,
                documentsVerified,
                equipmentAllocated,
                orientationCompleted,
                hrRepresentative
        );
    }

    @DeleteMapping("/{id}")
    public String deleteOnboarding(@PathVariable Long id) {
        onboardingService.deleteOnboarding(id);
        return "Onboarding record deleted successfully";
    }
}
