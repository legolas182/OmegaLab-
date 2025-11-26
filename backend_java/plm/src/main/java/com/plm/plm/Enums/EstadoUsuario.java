package com.plm.plm.Enums;

public enum EstadoUsuario {
    ACTIVO("activo"),
    INACTIVO("inactivo");

    private final String valor;

    EstadoUsuario(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static EstadoUsuario fromString(String valor) {
        for (EstadoUsuario estado : EstadoUsuario.values()) {
            if (estado.valor.equalsIgnoreCase(valor)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de usuario no válido: " + valor);
    }
}

