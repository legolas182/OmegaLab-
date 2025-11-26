package com.plm.plm.Enums;

public enum TipoProducto {
    PRODUCTO_TERMINADO("producto_terminado"),
    MATERIA_PRIMA("materia_prima"),
    COMPONENTE("componente");

    private final String valor;

    TipoProducto(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static TipoProducto fromString(String valor) {
        for (TipoProducto tipo : TipoProducto.values()) {
            if (tipo.valor.equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de producto no válido: " + valor);
    }
}

