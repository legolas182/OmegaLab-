package com.plm.plm.Config.exception;

/**
 * Excepción lanzada cuando el usuario no está autenticado o las credenciales son inválidas.
 * Retorna HTTP 401 (UNAUTHORIZED)
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

