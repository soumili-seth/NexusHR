package com.nexushr.service;

import com.nexushr.entity.Employee;
import com.nexushr.entity.Performance;
import com.nexushr.repository.EmployeeRepository;
import com.nexushr.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;

    public PerformanceService(
            PerformanceRepository performanceRepository,
            EmployeeRepository employeeRepository) {
        this.performanceRepository = performanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Performance> getAllReviews() {
        return performanceRepository.findAll();
    }

    public List<Performance> getReviewsByEmployee(Long employeeId) {
        return performanceRepository.findByEmployeeId(employeeId);
    }

    public Performance createReview(
            Long employeeId,
            String reviewPeriod,
            Integer rating,
            String feedback,
            String goals,
            LocalDate reviewDate) {

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5");
        }

        if (reviewPeriod == null || reviewPeriod.isBlank()) {
            throw new IllegalArgumentException(
                    "Review period is required");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Employee not found"));

        Performance performance = new Performance();
        performance.setEmployee(employee);
        performance.setReviewPeriod(reviewPeriod);
        performance.setRating(rating);
        performance.setFeedback(feedback);
        performance.setGoals(goals);
        performance.setReviewDate(
                reviewDate != null ? reviewDate : LocalDate.now());

        return performanceRepository.save(performance);
    }

    public void deleteReview(Long id) {
        if (!performanceRepository.existsById(id)) {
            throw new IllegalArgumentException("Performance review not found");
        }

        performanceRepository.deleteById(id);
    }
}