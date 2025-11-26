package com.plm.plm.Config.Exception;

/**
 * Excepción lanzada cuando el usuario no tiene permisos para realizar una acción.
 * Retorna HTTP 403 (FORBIDDEN)
 */
public class ForbiddenException extends RuntimeException {
    
    public ForbiddenException(String message) {
        super(message);
    }
    
    public ForbiddenException(String resourceName, String action) {
        super(String.format("No tiene permisos para %s en %s", action, resourceName));
    }
}

