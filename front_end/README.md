<<<<<<< HEAD
# Omega Lab - Sistema PLM/LIMS
=======
# Proscience Lab - Sistema PLM/LIMS
>>>>>>> origin/main

Sistema de gestión integral (híbrido PLM/LIMS) para empresa de nutracéuticos y suplementos dietarios, diseñado para cumplir con las Buenas Prácticas de Manufactura (BPM) colombianas según el Decreto 3249 de 2006.

## 🎯 Características Principales

### Módulos Implementados

1. **Dashboard** - Vista consolidada de lotes pendientes, KPIs y No Conformidades
2. **Ideas / Research** - Búsqueda en bases de datos moleculares (PubChem, ChEMBL, DrugBank, ZINC)
3. **Formulación (PLM)** - Gestión de BOM con control de versiones y justificación técnica
4. **IA / Simulación** - Extracción de datos y predicción de parámetros fisicoquímicos
5. **Producción / Proceso** - Órdenes de lote, dispensación digital y line clearance
6. **Pruebas / Control de Calidad (LIMS)** - Trazabilidad completa de muestras y gestión de OOS
7. **Aprobación / QA** - Liberación de producto con firma digital y gestión de NC/CAPA
8. **Trazabilidad Lote** - Línea de tiempo completa desde materias primas hasta distribución
9. **Base de Conocimiento** - Repositorio de SOPs, guías y farmacopeas con control de versiones
10. **Configuración** - Gestión de usuarios, roles, equipos y validaciones

### Cumplimiento Regulatorio

- ✅ **Data Integrity** - Registros inalterables con timestamps
- ✅ **BPM Compliance** - Cumplimiento Decreto 3249 de 2006
- ✅ **Validación de Sistemas** - Diseñado para validación completa
- ✅ **Trazabilidad Completa** - Desde origen hasta destino
- ✅ **Control de Calibración** - Vinculación automática de equipos
- ✅ **Firma Digital** - Liberación por profesional idóneo

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA y puede instalarse en dispositivos móviles y de escritorio. Incluye:

- Service Worker para funcionamiento offline
- Manifest para instalación
- Optimización para móviles

## 🛠️ Tecnologías

- **React 18** - Framework principal
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Vite** - Build tool
- **Vite PWA Plugin** - Funcionalidad PWA

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🔐 Seguridad y Cumplimiento

- Todos los registros críticos son inalterables una vez firmados
- Trazabilidad completa de usuarios y acciones
- Control de acceso basado en roles
- Validación de equipos y calibraciones
- Registro de timestamps automático

## 📝 Notas de Desarrollo

- El sistema está diseñado para ser validable según BPM
- Todos los módulos incluyen funcionalidades para mitigar NC críticas del INVIMA
- La integración con APIs moleculares está preparada pero requiere configuración de endpoints reales

## 📄 Licencia

<<<<<<< HEAD
Propietario - Omega Lab
=======
Propietario - Proscience Lab
>>>>>>> origin/main

