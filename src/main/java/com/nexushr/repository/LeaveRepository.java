
package com.nexushr.repository;

import com.nexushr.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeId(Long employeeId);

    List<Leave> findByStatus(String status);

    List<Leave> findByEmployeeIdAndAppliedDateAfter(
        Long employeeId,
        LocalDateTime startDate
    );
}
