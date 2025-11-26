package com.plm.plm.Config.exception;

/**
 * Excepción lanzada cuando un recurso no se encuentra en el sistema.
 * Retorna HTTP 404 (NOT FOUND)
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s no encontrado con %s: '%s'", resourceName, fieldName, fieldValue));
    }
}

