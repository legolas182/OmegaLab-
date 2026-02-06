package com.plm.plm.Config.exception;

import com.plm.plm.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para toda la aplicación.
 * Centraliza el manejo de errores y retorna respuestas estructuradas.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja excepciones cuando un recurso no se encuentra (404)
     */
    @ExceptionHandler(com.plm.plm.Config.exception.ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(
            com.plm.plm.Config.exception.ResourceNotFoundException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Not Found")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Maneja excepciones de solicitudes inválidas (400)
     */
    @ExceptionHandler(com.plm.plm.Config.exception.BadRequestException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadRequestException(
            BadRequestException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Bad Request")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja excepciones de recursos duplicados (409)
     */
    @ExceptionHandler(com.plm.plm.Config.exception.DuplicateResourceException.class)
    public ResponseEntity<ErrorResponseDTO> handleDuplicateResourceException(
            com.plm.plm.Config.exception.DuplicateResourceException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.CONFLICT.value())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Conflict")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Maneja excepciones de autenticación (401)
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponseDTO> handleUnauthorizedException(
            UnauthorizedException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Unauthorized")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Maneja excepciones de permisos insuficientes (403)
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponseDTO> handleForbiddenException(
            ForbiddenException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Forbidden")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Maneja errores de validación de @Valid en los DTOs (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        Map<String, Object> details = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            details.put(fieldName, errorMessage);
        });
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Error de validación en los datos enviados")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Bad Request")
                .details(details)
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja errores de validación de parámetros con @Validated (400)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        Map<String, Object> details = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Error de validación en los parámetros")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Bad Request")
                .details(details)
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja errores de tipo de argumento incorrecto (400)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        String message = String.format("El parámetro '%s' debe ser de tipo %s", 
                ex.getName(), 
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconocido");
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Bad Request")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja cualquier excepción no controlada (500)
     * NO expone información sensible del error interno
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        
        // Log del error completo para debugging (en producción usar un logger)
        ex.printStackTrace();
        System.err.println("Error en: " + request.getRequestURI());
        System.err.println("Mensaje: " + ex.getMessage());
        if (ex.getCause() != null) {
            System.err.println("Causa: " + ex.getCause().getMessage());
        }
        
        // En desarrollo, mostrar más detalles del error
        String message = "Error interno del servidor. Por favor, contacte al administrador.";
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            message += " Detalle: " + ex.getMessage();
        }
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(message)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .error("Internal Server Error")
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
