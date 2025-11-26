package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponseDTO {
    private Integer status;
    private String message;
    private LocalDateTime timestamp;
    private String path;
    private String error;
    private Map<String, Object> details;
}

