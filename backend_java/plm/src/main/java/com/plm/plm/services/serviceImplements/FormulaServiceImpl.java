package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.Exception.BadRequestException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoFormula;
import com.plm.plm.Models.*;
import com.plm.plm.Reposotory.*;
import com.plm.plm.dto.FormulaDTO;
import com.plm.plm.dto.FormulaIngredientDTO;
import com.plm.plm.dto.FormulaVersionDTO;
import com.plm.plm.services.FormulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormulaServiceImpl implements FormulaService {

    @Autowired
    private FormulaRepository formulaRepository;

    @Autowired
    private FormulaIngredientRepository formulaIngredientRepository;

    @Autowired
    private FormulaVersionRepository formulaVersionRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ChemicalCompoundRepository compoundRepository;

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public FormulaDTO createFormulaFromMaterials(
            String nombre,
            String objetivo,
            Double rendimiento,
            List<FormulaIngredientDTO> ingredientes,
            Integer userId) {

        // Validar datos
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new BadRequestException("El nombre de la fórmula es requerido");
        }

        if (ingredientes == null || ingredientes.isEmpty()) {
            throw new BadRequestException("La fórmula debe tener al menos un ingrediente");
        }

        // Validar que los porcentajes sumen 100%
        double sumaPorcentajes = ingredientes.stream()
            .mapToDouble(i -> i.getPorcentaje() != null ? i.getPorcentaje() : 0.0)
            .sum();

        if (Math.abs(sumaPorcentajes - 100.0) > 0.01) {
            throw new BadRequestException(
                String.format("La suma de porcentajes debe ser 100%%. Actual: %.2f%%", sumaPorcentajes));
        }

        // Generar código único
        String codigo = generateCodigoFormula(nombre);

        // Crear fórmula
        Formula formula = new Formula();
        formula.setCodigo(codigo);
        formula.setNombre(nombre);
        formula.setObjetivo(objetivo);
        formula.setRendimiento(rendimiento != null ? BigDecimal.valueOf(rendimiento) : BigDecimal.valueOf(100.0));
        formula.setEstado(EstadoFormula.DISENADA);

        if (userId != null) {
            User creador = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            formula.setCreador(creador);
        }

        formula = formulaRepository.save(formula);

        // Crear ingredientes
        List<FormulaIngredient> ingredientesEntities = new ArrayList<>();
        for (int i = 0; i < ingredientes.size(); i++) {
            FormulaIngredientDTO ingDTO = ingredientes.get(i);
            FormulaIngredient ing = new FormulaIngredient();
            ing.setFormula(formula);
            ing.setNombre(ingDTO.getNombre());
            ing.setCantidad(ingDTO.getCantidad() != null ? BigDecimal.valueOf(ingDTO.getCantidad()) : BigDecimal.ZERO);
            ing.setUnidad(ingDTO.getUnidad() != null ? ingDTO.getUnidad() : "g");
            ing.setPorcentaje(ingDTO.getPorcentaje() != null ? BigDecimal.valueOf(ingDTO.getPorcentaje()) : BigDecimal.ZERO);
            ing.setFuncion(ingDTO.getFuncion());
            ing.setSecuencia(i + 1);

            // Vincular material si existe
            if (ingDTO.getMaterialId() != null) {
                Material material = materialRepository.findById(ingDTO.getMaterialId())
                    .orElse(null);
                ing.setMaterial(material);
            }

            // Vincular compuesto químico si existe
            if (ingDTO.getCompoundId() != null) {
                ChemicalCompound compound = compoundRepository.findById(ingDTO.getCompoundId())
                    .orElse(null);
                ing.setCompound(compound);
            }

            ingredientesEntities.add(ing);
        }

        formulaIngredientRepository.saveAll(ingredientesEntities);

        // Crear versión inicial
        FormulaVersion version = new FormulaVersion();
        version.setFormula(formula);
        version.setVersion("1.0");
        version.setDescripcion("Versión inicial de la fórmula");
        version.setJustificacion("Fórmula creada desde materias primas");
        formulaVersionRepository.save(version);

        return formula.getDTO();
    }

    @Override
    @Transactional
    public FormulaDTO createVariant(
            Integer formulaId,
            String version,
            String justificacion,
            List<FormulaIngredientDTO> ingredientes,
            Integer userId) {

        Formula formula = formulaRepository.findById(formulaId)
            .orElseThrow(() -> new ResourceNotFoundException("Fórmula no encontrada"));

        // Validar que la versión no exista
        Optional<FormulaVersion> existingVersion = formulaVersionRepository.findByFormulaIdAndVersion(formulaId, version);
        if (existingVersion.isPresent()) {
            throw new BadRequestException("La versión " + version + " ya existe para esta fórmula");
        }

        // Validar porcentajes
        double sumaPorcentajes = ingredientes.stream()
            .mapToDouble(i -> i.getPorcentaje() != null ? i.getPorcentaje() : 0.0)
            .sum();

        if (Math.abs(sumaPorcentajes - 100.0) > 0.01) {
            throw new BadRequestException(
                String.format("La suma de porcentajes debe ser 100%%. Actual: %.2f%%", sumaPorcentajes));
        }

        // Eliminar ingredientes antiguos
        formulaIngredientRepository.deleteByFormulaId(formulaId);

        // Crear nuevos ingredientes
        List<FormulaIngredient> ingredientesEntities = new ArrayList<>();
        for (int i = 0; i < ingredientes.size(); i++) {
            FormulaIngredientDTO ingDTO = ingredientes.get(i);
            FormulaIngredient ing = new FormulaIngredient();
            ing.setFormula(formula);
            ing.setNombre(ingDTO.getNombre());
            ing.setCantidad(ingDTO.getCantidad() != null ? BigDecimal.valueOf(ingDTO.getCantidad()) : BigDecimal.ZERO);
            ing.setUnidad(ingDTO.getUnidad() != null ? ingDTO.getUnidad() : "g");
            ing.setPorcentaje(ingDTO.getPorcentaje() != null ? BigDecimal.valueOf(ingDTO.getPorcentaje()) : BigDecimal.ZERO);
            ing.setFuncion(ingDTO.getFuncion());
            ing.setSecuencia(i + 1);

            if (ingDTO.getMaterialId() != null) {
                Material material = materialRepository.findById(ingDTO.getMaterialId()).orElse(null);
                ing.setMaterial(material);
            }

            if (ingDTO.getCompoundId() != null) {
                ChemicalCompound compound = compoundRepository.findById(ingDTO.getCompoundId()).orElse(null);
                ing.setCompound(compound);
            }

            ingredientesEntities.add(ing);
        }

        formulaIngredientRepository.saveAll(ingredientesEntities);

        // Crear nueva versión
        FormulaVersion formulaVersion = new FormulaVersion();
        formulaVersion.setFormula(formula);
        formulaVersion.setVersion(version);
        formulaVersion.setJustificacion(justificacion);
        formulaVersionRepository.save(formulaVersion);

        return formula.getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public FormulaDTO getFormulaById(Integer id) {
        Formula formula = formulaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fórmula no encontrada"));
        return formula.getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormulaDTO> getAllFormulas(String estado, String search) {
        List<Formula> formulas;

        if (estado != null && !estado.trim().isEmpty()) {
            try {
                EstadoFormula estadoEnum = EstadoFormula.fromString(estado);
                formulas = formulaRepository.findByEstado(estadoEnum);
            } catch (IllegalArgumentException e) {
                formulas = formulaRepository.findAll();
            }
        } else if (search != null && !search.trim().isEmpty()) {
            formulas = formulaRepository.searchByNombreOrCodigo(search.trim());
        } else {
            formulas = formulaRepository.findAll();
        }

        return formulas.stream()
            .map(Formula::getDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormulaVersionDTO> getFormulaVersions(Integer formulaId) {
        List<FormulaVersion> versions = formulaVersionRepository.findByFormulaIdOrderByVersionAsc(formulaId);
        return versions.stream()
            .map(FormulaVersion::getDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FormulaDTO updateFormula(Integer id, FormulaDTO formulaDTO) {
        Formula formula = formulaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fórmula no encontrada"));

        if (formulaDTO.getNombre() != null) {
            formula.setNombre(formulaDTO.getNombre());
        }
        if (formulaDTO.getObjetivo() != null) {
            formula.setObjetivo(formulaDTO.getObjetivo());
        }
        if (formulaDTO.getRendimiento() != null) {
            formula.setRendimiento(BigDecimal.valueOf(formulaDTO.getRendimiento()));
        }

        return formulaRepository.save(formula).getDTO();
    }

    @Override
    @Transactional
    public FormulaDTO changeEstado(Integer id, String nuevoEstado, Integer userId) {
        Formula formula = formulaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fórmula no encontrada"));

        EstadoFormula estadoEnum = EstadoFormula.fromString(nuevoEstado);
        formula.setEstado(estadoEnum);

        return formulaRepository.save(formula).getDTO();
    }

    @Override
    @Transactional
    public void deleteFormula(Integer id) {
        if (!formulaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fórmula no encontrada");
        }
        formulaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> validateFormula(FormulaDTO formula) {
        Map<String, Object> validation = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Validar suma de porcentajes
        if (formula.getIngredientes() != null) {
            double sumaPorcentajes = formula.getIngredientes().stream()
                .mapToDouble(i -> i.getPorcentaje() != null ? i.getPorcentaje() : 0.0)
                .sum();

            if (Math.abs(sumaPorcentajes - 100.0) > 0.01) {
                errors.add(String.format("La suma de porcentajes debe ser 100%%. Actual: %.2f%%", sumaPorcentajes));
            } else {
                validation.put("sumaPorcentajes", true);
            }
        }

        // Validar que haya ingredientes
        if (formula.getIngredientes() == null || formula.getIngredientes().isEmpty()) {
            errors.add("La fórmula debe tener al menos un ingrediente");
        }

        validation.put("valid", errors.isEmpty());
        validation.put("errors", errors);
        validation.put("warnings", warnings);

        return validation;
    }

    // Método auxiliar privado
    private String generateCodigoFormula(String nombre) {
        String base = "FORM-" + LocalDateTime.now().getYear() + "-";
        String nombreCodigo = nombre.toUpperCase()
            .replaceAll("[^A-Z0-9]", "")
            .substring(0, Math.min(6, nombre.length()));
        
        String codigo = base + nombreCodigo;
        int counter = 1;
        
        while (formulaRepository.existsByCodigo(codigo)) {
            codigo = base + nombreCodigo + "-" + counter;
            counter++;
        }
        
        return codigo;
    }
}

