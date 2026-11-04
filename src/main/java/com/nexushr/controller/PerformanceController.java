package com.nexushr.controller;

import com.nexushr.entity.Performance;
import com.nexushr.service.PerformanceService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "http://localhost:5173")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping
    public List<Performance> getAllReviews() {
        return performanceService.getAllReviews();
    }

    @GetMapping("/employee/{employeeId}")
    public List<Performance> getReviewsByEmployee(
            @PathVariable Long employeeId) {
        return performanceService.getReviewsByEmployee(employeeId);
    }

    @PostMapping
    public Performance createReview(
            @RequestParam Long employeeId,
            @RequestParam String reviewPeriod,
            @RequestParam Integer rating,
            @RequestParam(required = false) String feedback,
            @RequestParam(required = false) String goals,
            @RequestParam(required = false) LocalDate reviewDate) {

        return performanceService.createReview(
                employeeId,
                reviewPeriod,
                rating,
                feedback,
                goals,
                reviewDate
        );
    }

    @DeleteMapping("/{id}")
    public String deleteReview(@PathVariable Long id) {
        performanceService.deleteReview(id);
        return "Performance review deleted successfully";
    }
}