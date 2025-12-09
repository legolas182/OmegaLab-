package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.Exception.BadRequestException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoBOM;
import com.plm.plm.Enums.EstadoFormula;
import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.Models.*;
import com.plm.plm.Reposotory.*;
import com.plm.plm.dto.BOMItemDTO;
import com.plm.plm.dto.DispensacionDTO;
import com.plm.plm.dto.DispensacionItemDTO;
import com.plm.plm.dto.LineClearanceDTO;
import com.plm.plm.dto.OrdenProduccionDTO;
import com.plm.plm.services.ProduccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProduccionServiceImpl implements ProduccionService {

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private OrdenProduccionRepository ordenProduccionRepository;

    @Autowired
    private DispensacionRepository dispensacionRepository;

    @Autowired
    private DispensacionItemRepository dispensacionItemRepository;

    @Autowired
    private LineClearanceRepository lineClearanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BOMRepository bomRepository;

    @Autowired
    private BOMItemRepository bomItemRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private FormulaRepository formulaRepository;

    @Autowired
    private FormulaIngredientRepository formulaIngredientRepository;

    @Override
    @Transactional
    public List<OrdenProduccionDTO> getOrdenesProduccion() {
        List<Idea> ideas = ideaRepository.findByEstado(EstadoIdea.EN_PRODUCCION);
        
        return ideas.stream().map(idea -> {
            List<OrdenProduccion> ordenesExistentes = ordenProduccionRepository.findByIdeaId(idea.getId());
            OrdenProduccion orden;
            
            if (!ordenesExistentes.isEmpty()) {
                orden = ordenesExistentes.get(0);
            } else {
                orden = new OrdenProduccion();
                orden.setCodigo("OP-" + idea.getId());
                orden.setIdea(idea);
                orden.setCantidad(BigDecimal.valueOf(1000));
                orden.setEstado("EN_PROCESO");
                orden.setSupervisorCalidad(idea.getAsignadoA());
                orden.setFechaInicio(idea.getApprovedAt());
                orden = ordenProduccionRepository.save(orden);
            }
            
            if (orden.getDispensacion() != null) {
                orden.getDispensacion().getItems().size();
            }
            if (orden.getLineClearance() != null) {
                orden.getLineClearance().getId();
            }
            
            return orden.getDTO();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenProduccionDTO getOrdenById(Integer id) {
        OrdenProduccion orden = ordenProduccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        if (orden.getDispensacion() != null) {
            orden.getDispensacion().getItems().size();
        }
        if (orden.getLineClearance() != null) {
            orden.getLineClearance().getId();
        }
        
        return orden.getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public DispensacionDTO getDispensacionByOrdenId(Integer ordenId) {
        Optional<Dispensacion> dispensacionOpt = dispensacionRepository.findByOrdenId(ordenId);
        
        if (dispensacionOpt.isPresent()) {
            Dispensacion dispensacion = dispensacionOpt.get();
            dispensacion.getItems().size();
            return dispensacion.getDTO();
        }
        
        OrdenProduccion orden = ordenProduccionRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        Idea idea = orden.getIdea();
        BigDecimal cantidadOrden = orden.getCantidad();
        
        if (cantidadOrden == null || cantidadOrden.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("La cantidad de la orden de producción es obligatoria y debe ser mayor a cero");
        }
        
        DispensacionDTO dto = new DispensacionDTO();
        dto.setOrdenId(ordenId);
        dto.setCompletada(false);
        
        List<Formula> formulas = formulaRepository.findByIdeaId(idea.getId());
        if (formulas.isEmpty()) {
            throw new ResourceNotFoundException("No se encontró una fórmula asociada a la idea. La fórmula es obligatoria para generar la dispensación");
        }
        
        Formula formula = formulas.stream()
                .filter(f -> f.getEstado() == EstadoFormula.PRUEBA_APROBADA || 
                            f.getEstado() == EstadoFormula.EN_PRODUCCION ||
                            f.getEstado() == EstadoFormula.APROBADA)
                .findFirst()
                .orElse(formulas.get(0));
        List<FormulaIngredient> ingredientes = formulaIngredientRepository.findByFormulaIdOrderBySecuenciaAsc(formula.getId());
        
        if (ingredientes.isEmpty()) {
            throw new ResourceNotFoundException("La fórmula no tiene ingredientes definidos");
        }
        
        BigDecimal rendimientoBase = formula.getRendimiento() != null ? formula.getRendimiento() : BigDecimal.valueOf(100.0);
        if (rendimientoBase.compareTo(BigDecimal.ZERO) <= 0) {
            rendimientoBase = BigDecimal.valueOf(100.0);
        }
        
        BigDecimal factorEscala = cantidadOrden.divide(rendimientoBase, 4, java.math.RoundingMode.HALF_UP);
        
        List<DispensacionItemDTO> items = ingredientes.stream().map(ingrediente -> {
            DispensacionItemDTO itemDTO = new DispensacionItemDTO();
            if (ingrediente.getMaterial() != null) {
                itemDTO.setMaterialId(ingrediente.getMaterial().getId());
                itemDTO.setMaterialNombre(ingrediente.getMaterial().getNombre());
                itemDTO.setMaterialCodigo(ingrediente.getMaterial().getCodigo());
            } else {
                itemDTO.setMaterialId(null);
                itemDTO.setMaterialNombre(ingrediente.getNombre());
                itemDTO.setMaterialCodigo(null);
            }
            
            BigDecimal cantidadBase = ingrediente.getCantidad() != null ? ingrediente.getCantidad() : BigDecimal.ZERO;
            BigDecimal cantidadRequerida = cantidadBase.multiply(factorEscala).setScale(4, java.math.RoundingMode.HALF_UP);
            
            if (cantidadRequerida.compareTo(BigDecimal.ZERO) <= 0) {
                BigDecimal porcentaje = ingrediente.getPorcentaje() != null ? ingrediente.getPorcentaje() : BigDecimal.ZERO;
                cantidadRequerida = cantidadOrden.multiply(porcentaje).divide(BigDecimal.valueOf(100.0), 4, java.math.RoundingMode.HALF_UP);
            }
            
            itemDTO.setCantidadRequerida(cantidadRequerida);
            itemDTO.setUnidadRequerida(ingrediente.getUnidad() != null ? ingrediente.getUnidad() : "g");
            itemDTO.setCantidadPesada(BigDecimal.ZERO);
            itemDTO.setSecuencia(ingrediente.getSecuencia() != null ? ingrediente.getSecuencia() : 0);
            return itemDTO;
        }).collect(Collectors.toList());
        
        dto.setItems(items);
        return dto;
    }

    @Override
    @Transactional
    public DispensacionDTO saveDispensacion(Integer ordenId, DispensacionDTO dispensacionDTO, Integer userId) {
        OrdenProduccion orden = ordenProduccionRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        Dispensacion dispensacion;
        Optional<Dispensacion> dispensacionOpt = dispensacionRepository.findByOrdenId(ordenId);
        
        if (dispensacionOpt.isPresent()) {
            dispensacion = dispensacionOpt.get();
            dispensacionItemRepository.deleteAll(dispensacion.getItems());
            dispensacion.getItems().clear();
        } else {
            dispensacion = new Dispensacion();
            dispensacion.setOrden(orden);
        }
        
        dispensacion.setCompletada(true);
        dispensacion.setRealizadaPor(usuario);
        dispensacion.setEquipoUtilizado(dispensacionDTO.getEquipoUtilizado());
        dispensacion.setFechaCalibracion(dispensacionDTO.getFechaCalibracion());
        
        if (dispensacionDTO.getItems() != null) {
            for (DispensacionItemDTO itemDTO : dispensacionDTO.getItems()) {
                Material material = materialRepository.findById(itemDTO.getMaterialId())
                        .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado: " + itemDTO.getMaterialId()));
                
                DispensacionItem item = new DispensacionItem();
                item.setDispensacion(dispensacion);
                item.setMaterial(material);
                item.setCantidadRequerida(itemDTO.getCantidadRequerida());
                item.setUnidadRequerida(itemDTO.getUnidadRequerida());
                item.setCantidadPesada(itemDTO.getCantidadPesada());
                item.setSecuencia(itemDTO.getSecuencia());
                
                dispensacion.getItems().add(item);
            }
        }
        
        dispensacion = dispensacionRepository.save(dispensacion);
        orden.setDispensacion(dispensacion);
        ordenProduccionRepository.save(orden);
        
        dispensacion.getItems().size();
        return dispensacion.getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public LineClearanceDTO getLineClearanceByOrdenId(Integer ordenId) {
        Optional<LineClearance> lineClearanceOpt = lineClearanceRepository.findByOrdenId(ordenId);
        
        if (lineClearanceOpt.isPresent()) {
            return lineClearanceOpt.get().getDTO();
        }
        
        LineClearanceDTO dto = new LineClearanceDTO();
        dto.setOrdenId(ordenId);
        dto.setCompletado(false);
        dto.setLineaLimpia(false);
        dto.setSinResiduos(false);
        dto.setEquiposVerificados(false);
        dto.setDocumentacionCompleta(false);
        dto.setMaterialesCorrectos(false);
        return dto;
    }

    @Override
    @Transactional
    public LineClearanceDTO saveLineClearance(Integer ordenId, LineClearanceDTO lineClearanceDTO, Integer userId) {
        OrdenProduccion orden = ordenProduccionRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        LineClearance lineClearance;
        Optional<LineClearance> lineClearanceOpt = lineClearanceRepository.findByOrdenId(ordenId);
        
        if (lineClearanceOpt.isPresent()) {
            lineClearance = lineClearanceOpt.get();
        } else {
            lineClearance = new LineClearance();
            lineClearance.setOrden(orden);
        }
        
        lineClearance.setCompletado(true);
        lineClearance.setLineaLimpia(lineClearanceDTO.getLineaLimpia());
        lineClearance.setSinResiduos(lineClearanceDTO.getSinResiduos());
        lineClearance.setEquiposVerificados(lineClearanceDTO.getEquiposVerificados());
        lineClearance.setDocumentacionCompleta(lineClearanceDTO.getDocumentacionCompleta());
        lineClearance.setMaterialesCorrectos(lineClearanceDTO.getMaterialesCorrectos());
        lineClearance.setVerificadoPor(usuario);
        lineClearance.setObservaciones(lineClearanceDTO.getObservaciones());
        
        lineClearance = lineClearanceRepository.save(lineClearance);
        orden.setLineClearance(lineClearance);
        ordenProduccionRepository.save(orden);
        
        return lineClearance.getDTO();
    }
}

