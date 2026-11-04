
package com.nexushr.repository;

import com.nexushr.entity.Onboarding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OnboardingRepository
        extends JpaRepository<Onboarding, Long> {

    Optional<Onboarding> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeId(Long employeeId);
}
