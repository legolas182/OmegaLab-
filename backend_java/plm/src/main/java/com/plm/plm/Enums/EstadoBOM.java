package com.plm.plm.Enums;

public enum EstadoBOM {
    BORRADOR("borrador"),
    APROBADO("aprobado"),
    OBSOLETO("obsoleto");

    private final String valor;

    EstadoBOM(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static EstadoBOM fromString(String valor) {
        for (EstadoBOM estado : EstadoBOM.values()) {
            if (estado.valor.equalsIgnoreCase(valor)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de BOM no válido: " + valor);
    }
}

