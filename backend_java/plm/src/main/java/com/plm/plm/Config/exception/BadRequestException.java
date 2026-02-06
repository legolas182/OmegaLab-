package com.plm.plm.Config.exception;

/**
 * Excepción lanzada cuando la solicitud del cliente es inválida o mal formada.
 * Retorna HTTP 400 (BAD REQUEST)
 */
public class BadRequestException extends RuntimeException {
    
    public BadRequestException(String message) {
        super(message);
    }
    
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}

