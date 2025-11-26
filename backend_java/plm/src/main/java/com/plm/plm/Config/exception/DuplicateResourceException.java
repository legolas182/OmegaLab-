package com.plm.plm.Config.Exception;

/**
 * Excepción lanzada cuando se intenta crear un recurso que ya existe.
 * Retorna HTTP 409 (CONFLICT)
 */
public class DuplicateResourceException extends RuntimeException {
    
    public DuplicateResourceException(String message) {
        super(message);
    }
    
    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s ya existe con %s: '%s'", resourceName, fieldName, fieldValue));
    }
}

