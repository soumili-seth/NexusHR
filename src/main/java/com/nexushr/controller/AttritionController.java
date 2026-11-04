
package com.nexushr.controller;

import com.nexushr.dto.AttritionRiskResponse;
import com.nexushr.service.AttritionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attrition")
@CrossOrigin(origins = "http://localhost:5173")
public class AttritionController {

    private final AttritionService attritionService;

    public AttritionController(AttritionService attritionService) {
        this.attritionService = attritionService;
    }

    @GetMapping("/analysis")
    public List<AttritionRiskResponse> getAttritionAnalysis() {
        return attritionService.analyzeAllEmployees();
    }
}
