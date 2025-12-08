package com.plm.plm.Enums;

public enum EstadoFormula {
    DISENADA("disenada", "Diseñada"),
    EN_REVISION("en_revision", "En Revisión"),
    APROBADA("aprobada", "Aprobada"),
    EN_PRUEBA("en_prueba", "En Prueba"),
    PRUEBA_APROBADA("prueba_aprobada", "Prueba Aprobada"),
    EN_PRODUCCION("en_produccion", "En Producción"),
    OBSOLETA("obsoleta", "Obsoleta");

    private final String value;
    private final String label;

    EstadoFormula(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public static EstadoFormula fromString(String value) {
        if (value == null) {
            return null;
        }
        for (EstadoFormula estado : EstadoFormula.values()) {
            if (estado.value.equalsIgnoreCase(value) || estado.name().equalsIgnoreCase(value)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de fórmula no válido: " + value);
    }
}

