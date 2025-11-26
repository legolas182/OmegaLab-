package com.plm.plm.services;

import com.plm.plm.Enums.Rol;
import com.plm.plm.Models.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Servicio para manejar permisos basados en roles
 * Centraliza la lógica de autorización del sistema
 */
@Service
public class RolePermissionService {

    /**
     * Obtiene el usuario autenticado actual
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        // El usuario se puede obtener del contexto de seguridad si se almacena allí
        // Por ahora retornamos null, se puede mejorar según la implementación
        return null;
    }

    /**
     * Obtiene el rol del usuario autenticado actual
     */
    public Rol getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // Extraer el rol de las autoridades
        return authentication.getAuthorities().stream()
            .map(authority -> {
                String authorityName = authority.getAuthority();
                if (authorityName.startsWith("ROLE_")) {
                    String roleName = authorityName.substring(5); // Remover "ROLE_"
                    try {
                        return Rol.valueOf(roleName);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                }
                return null;
            })
            .filter(rol -> rol != null)
            .findFirst()
            .orElse(null);
    }

    /**
     * Verifica si el usuario actual tiene uno de los roles especificados
     */
    public boolean hasAnyRole(Rol... roles) {
        Rol currentRole = getCurrentUserRole();
        if (currentRole == null) {
            return false;
        }
        for (Rol role : roles) {
            if (currentRole == role) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verifica si el usuario actual tiene el rol especificado
     */
    public boolean hasRole(Rol role) {
        return hasAnyRole(role);
    }

    // ========== PERMISOS ESPECÍFICOS POR ROL ==========

    /**
     * Verifica si el usuario puede otorgar roles (solo Administrador)
     */
    public boolean canAssignRoles() {
        return hasRole(Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario tiene acceso a fórmulas reales (solo Supervisor QA)
     */
    public boolean canAccessRealFormulas() {
        return hasAnyRole(Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede recibir materias primas (Supervisor Calidad y Supervisor QA)
     */
    public boolean canReceiveRawMaterials() {
        return hasAnyRole(Rol.SUPERVISOR_CALIDAD, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede ingresar datos de proveedor, lotes y trazabilidad
     * (Supervisor Calidad, Supervisor QA y Administrador)
     */
    public boolean canManageSupplierData() {
        return hasAnyRole(Rol.SUPERVISOR_CALIDAD, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede gestionar análisis de materias primas
     * (Supervisor Calidad, Supervisor QA y Administrador)
     */
    public boolean canManageRawMaterialAnalysis() {
        return hasAnyRole(Rol.SUPERVISOR_CALIDAD, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede hacer devoluciones de materias primas no aptas
     * (Supervisor Calidad, Supervisor QA y Administrador)
     */
    public boolean canReturnRawMaterials() {
        return hasAnyRole(Rol.SUPERVISOR_CALIDAD, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede recibir órdenes de formulación
     * (Analista Laboratorio, Supervisor QA y Administrador)
     */
    public boolean canReceiveFormulationOrders() {
        return hasAnyRole(Rol.ANALISTA_LABORATORIO, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede ingresar análisis sensorial
     * (Analista Laboratorio, Supervisor QA y Administrador)
     */
    public boolean canEnterSensoryAnalysis() {
        return hasAnyRole(Rol.ANALISTA_LABORATORIO, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario tiene visión total del sistema
     * (Supervisor QA y Administrador)
     */
    public boolean hasFullSystemView() {
        return hasAnyRole(Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede ver el estado de formulación y quién está operando
     * (Supervisor QA y Administrador)
     */
    public boolean canViewFormulationStatus() {
        return hasAnyRole(Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede ver trazabilidad completa
     * (Supervisor Calidad, Supervisor QA y Administrador)
     */
    public boolean canViewTraceability() {
        return hasAnyRole(Rol.SUPERVISOR_CALIDAD, Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede gestionar análisis de formulaciones
     * (Solo Supervisor QA y Administrador - Supervisor Calidad NO tiene este permiso)
     */
    public boolean canManageFormulationAnalysis() {
        return hasAnyRole(Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede recibir notificaciones de stock, lotes, trazabilidad, etc.
     * (Supervisor QA y Administrador)
     */
    public boolean canReceiveNotifications() {
        return hasAnyRole(Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }

    /**
     * Verifica si el usuario puede acceder a documentos y reportes
     * (Supervisor QA y Administrador)
     */
    public boolean canAccessDocumentsAndReports() {
        return hasAnyRole(Rol.SUPERVISOR_QA, Rol.ADMINISTRADOR);
    }
}

