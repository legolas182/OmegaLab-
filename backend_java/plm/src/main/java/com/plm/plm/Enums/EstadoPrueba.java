package com.plm.plm.Enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoPrueba {
    PENDIENTE("pendiente"),
    EN_PROCESO("en_proceso"),
    COMPLETADA("completada"),
    OOS("oos"),
    RECHAZADA("rechazada");

    private final String valor;

    EstadoPrueba(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    public static EstadoPrueba fromString(String valor) {
        for (EstadoPrueba estado : EstadoPrueba.values()) {
            if (estado.valor.equalsIgnoreCase(valor)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de Prueba no válido: " + valor);
    }
}

