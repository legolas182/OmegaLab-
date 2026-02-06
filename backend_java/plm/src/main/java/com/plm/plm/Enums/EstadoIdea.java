package com.plm.plm.Enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoIdea {
    GENERADA("generada"),           // Generada por IA, pendiente revisión
    EN_REVISION("en_revision"),     // SUPERVISOR_QA revisando
    APROBADA("aprobada"),           // Aprobada para pruebas
    EN_PRUEBA("en_prueba"),         // Asignada a analista para pruebas
    PRUEBA_APROBADA("prueba_aprobada"), // Pruebas pasadas, lista para producción
    OOS("oos"),                       // Fuera de especificación - requiere investigación
    RECHAZADA("rechazada"),           // Rechazada explícitamente
    EN_PRODUCCION("en_produccion");   // En producción

    private final String valor;

    EstadoIdea(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    public static EstadoIdea fromString(String valor) {
        for (EstadoIdea estado : EstadoIdea.values()) {
            if (estado.valor.equalsIgnoreCase(valor)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de Idea no válido: " + valor);
    }
}

