package com.plm.plm.Enums;


public enum Rol {
    /**
     * Administrador / Usuario Avanzado: Soporte técnico del sistema, puede otorgar roles.
     * Tiene acceso completo al sistema.
     */
    ADMINISTRADOR("administrador"),
    
    /**
     * Supervisor QA: Acceso completo a fórmulas reales en la base de datos.
     * Visión total del sistema, recibe notificaciones de stock, lotes, trazabilidad,
     * documentos, reportes, alertas. Puede ver el estado de formulación y quién está operando.
     */
    SUPERVISOR_QA("supervisor_qa"),
    
    /**
     * Supervisor Calidad: Recibe materias primas, ingresa datos de proveedor, lotes, trazabilidad.
     * Lleva el informe del estado del análisis de materias primas antes de pasar a formulación.
     * Hace devoluciones de materias primas no aptas. No tiene permisos sobre análisis de formulaciones.
     */
    SUPERVISOR_CALIDAD("supervisor_calidad"),
    
    /**
     * Analista de Laboratorio: Auxiliar de I+D. Recibe órdenes de formulación.
     * No tiene acceso a base de datos con fórmulas reales. Solo cumple requerimientos
     * especificados en órdenes, desarrollo de la misma e ingreso del análisis sensorial.
     */
    ANALISTA_LABORATORIO("analista_laboratorio");

    private final String valor;

    Rol(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static Rol fromString(String valor) {
        for (Rol rol : Rol.values()) {
            if (rol.valor.equalsIgnoreCase(valor)) {
                return rol;
            }
        }
        throw new IllegalArgumentException("Rol no válido: " + valor);
    }
}

