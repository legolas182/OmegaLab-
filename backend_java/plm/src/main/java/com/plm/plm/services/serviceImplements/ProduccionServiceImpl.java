package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.exception.BadRequestException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoFormula;
import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.Models.*;
import com.plm.plm.Reposotory.*;
import com.plm.plm.dto.LoteDTO;
import com.plm.plm.dto.MaterialNecesarioDTO;
import com.plm.plm.dto.OrdenDetalleDTO;
import com.plm.plm.dto.OrdenProduccionDTO;
import com.plm.plm.services.ProduccionService;
import com.plm.plm.services.FormulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProduccionServiceImpl implements ProduccionService {

    @Autowired
    private OrdenProduccionRepository ordenProduccionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormulaRepository formulaRepository;

    @Autowired
    private FormulaIngredientRepository formulaIngredientRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private LoteEventoRepository loteEventoRepository;

    @Autowired
    private FormulaService formulaService;

    @Override
    @Transactional(readOnly = true)
    public List<OrdenProduccionDTO> getOrdenesProduccion() {
        List<OrdenProduccion> ordenes = ordenProduccionRepository.findAll();
        
        return ordenes.stream()
                .filter(orden -> orden.getIdea() != null && orden.getIdea().getEstado() == EstadoIdea.EN_PRODUCCION)
                .map(OrdenProduccion::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenProduccionDTO getOrdenById(Integer id) {
        OrdenProduccion orden = ordenProduccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        return orden.getDTO();
    }

    @Override
    @Transactional
    public OrdenDetalleDTO getOrdenDetalle(Integer ordenId) {
        OrdenProduccion orden = ordenProduccionRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        Idea idea = orden.getIdea();
        BigDecimal cantidadOrden = orden.getCantidad();
        
        if (cantidadOrden == null || cantidadOrden.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("La cantidad de la orden de producción es obligatoria y debe ser mayor a cero");
        }
        
        List<Formula> formulas = formulaRepository.findByIdeaId(idea.getId());
        if (formulas.isEmpty()) {
            if (idea.getDetallesIA() == null || idea.getDetallesIA().trim().isEmpty()) {
                throw new ResourceNotFoundException("No se encontró una fórmula asociada a la idea y la idea no tiene detalles de IA para crear la fórmula. La fórmula es obligatoria para generar la producción");
            }
            User creador = orden.getSupervisorCalidad() != null ? orden.getSupervisorCalidad() : 
                          (idea.getCreador() != null ? idea.getCreador() : null);
            if (creador == null) {
                throw new BadRequestException("No se puede crear la fórmula: no se encontró un usuario válido para asignar como creador");
            }
            formulaService.createFormulaFromIdea(idea.getId(), creador.getId());
            formulas = formulaRepository.findByIdeaId(idea.getId());
            if (formulas.isEmpty()) {
                throw new ResourceNotFoundException("No se pudo crear la fórmula asociada a la idea. La fórmula es obligatoria para generar la producción");
            }
        }
        
        Formula formula = formulas.stream()
                .filter(f -> f.getEstado() == EstadoFormula.PRUEBA_APROBADA || 
                            f.getEstado() == EstadoFormula.EN_PRODUCCION ||
                            f.getEstado() == EstadoFormula.APROBADA ||
                            f.getEstado() == EstadoFormula.EN_PRUEBA ||
                            f.getEstado() == EstadoFormula.DISENADA)
                .findFirst()
                .orElse(formulas.stream()
                        .max((f1, f2) -> {
                            if (f1.getCreatedAt() == null && f2.getCreatedAt() == null) return 0;
                            if (f1.getCreatedAt() == null) return -1;
                            if (f2.getCreatedAt() == null) return 1;
                            return f2.getCreatedAt().compareTo(f1.getCreatedAt());
                        })
                        .orElse(formulas.get(0)));
        
        List<FormulaIngredient> ingredientes = formulaIngredientRepository.findByFormulaIdOrderBySecuenciaAsc(formula.getId());
        
        if (ingredientes.isEmpty()) {
            throw new ResourceNotFoundException("La fórmula no tiene ingredientes definidos");
        }
        
        BigDecimal rendimientoBase = formula.getRendimiento() != null ? formula.getRendimiento() : BigDecimal.valueOf(100.0);
        if (rendimientoBase.compareTo(BigDecimal.ZERO) <= 0) {
            rendimientoBase = BigDecimal.valueOf(100.0);
        }
        
        BigDecimal factorEscala = cantidadOrden.divide(rendimientoBase, 4, java.math.RoundingMode.HALF_UP);
        
        List<MaterialNecesarioDTO> materiales = ingredientes.stream().map(ingrediente -> {
            MaterialNecesarioDTO materialDTO = new MaterialNecesarioDTO();
            if (ingrediente.getMaterial() != null) {
                materialDTO.setMaterialId(ingrediente.getMaterial().getId());
                materialDTO.setMaterialNombre(ingrediente.getMaterial().getNombre());
                materialDTO.setMaterialCodigo(ingrediente.getMaterial().getCodigo());
            } else {
                materialDTO.setMaterialId(null);
                materialDTO.setMaterialNombre(ingrediente.getNombre());
                materialDTO.setMaterialCodigo(null);
            }
            
            BigDecimal cantidadBase = ingrediente.getCantidad() != null ? ingrediente.getCantidad() : BigDecimal.ZERO;
            BigDecimal cantidadRequerida = cantidadBase.multiply(factorEscala).setScale(4, java.math.RoundingMode.HALF_UP);
            
            if (cantidadRequerida.compareTo(BigDecimal.ZERO) <= 0) {
                BigDecimal porcentaje = ingrediente.getPorcentaje() != null ? ingrediente.getPorcentaje() : BigDecimal.ZERO;
                cantidadRequerida = cantidadOrden.multiply(porcentaje).divide(BigDecimal.valueOf(100.0), 4, java.math.RoundingMode.HALF_UP);
            }
            
            materialDTO.setCantidadRequerida(cantidadRequerida);
            materialDTO.setUnidadRequerida(ingrediente.getUnidad() != null ? ingrediente.getUnidad() : "g");
            materialDTO.setPorcentaje(ingrediente.getPorcentaje() != null ? ingrediente.getPorcentaje() : BigDecimal.ZERO);
            materialDTO.setSecuencia(ingrediente.getSecuencia() != null ? ingrediente.getSecuencia() : 0);
            materialDTO.setFuncion(ingrediente.getFuncion());
            return materialDTO;
        }).collect(Collectors.toList());
        
        OrdenDetalleDTO dto = new OrdenDetalleDTO();
        dto.setId(orden.getId());
        dto.setCodigo(orden.getCodigo());
        dto.setIdeaTitulo(idea.getTitulo());
        dto.setIdeaDescripcion(idea.getDescripcion());
        dto.setIdeaObjetivo(idea.getObjetivo());
        dto.setIdeaCategoria(idea.getCategoriaEntity() != null ? idea.getCategoriaEntity().getNombre() : null);
        dto.setIdeaCreatedByName(idea.getCreador() != null ? idea.getCreador().getNombre() : null);
        dto.setIdeaCreatedAt(idea.getCreatedAt());
        dto.setIdeaAsignadoANombre(idea.getAsignadoA() != null ? idea.getAsignadoA().getNombre() : null);
        dto.setCantidad(cantidadOrden);
        dto.setEstado(orden.getEstado());
        dto.setSupervisorCalidadNombre(orden.getSupervisorCalidad() != null ? orden.getSupervisorCalidad().getNombre() : null);
        dto.setLoteId(orden.getLote() != null ? orden.getLote().getId() : null);
        dto.setLoteCodigo(orden.getLote() != null ? orden.getLote().getCodigo() : null);
        dto.setMateriales(materiales);
        
        return dto;
    }

    @Override
    @Transactional
    public LoteDTO generarLote(Integer ordenId, Integer userId) {
        OrdenProduccion orden = ordenProduccionRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de producción no encontrada"));
        
        if (orden.getLote() != null) {
            throw new BadRequestException("Esta orden ya tiene un lote asociado");
        }
        
        User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        LocalDateTime ahora = LocalDateTime.now();
        String codigoLote = "LOTE-" + ahora.getYear() + "-" + String.format("%03d", loteRepository.count() + 1);
        
        Lote lote = new Lote();
        lote.setCodigo(codigoLote);
        lote.setOrden(orden);
        lote.setFechaProduccion(ahora);
        lote.setEstado("EN_PROCESO");
        lote = loteRepository.save(lote);
        
        LoteEvento eventoInicio = new LoteEvento();
        eventoInicio.setLote(lote);
        eventoInicio.setTipo("Proceso");
        eventoInicio.setDescripcion("Inicio de Producción - Orden " + orden.getCodigo());
        eventoInicio.setFecha(ahora);
        eventoInicio.setHora(ahora.format(DateTimeFormatter.ofPattern("HH:mm")));
        eventoInicio.setIdentificador("PROD-" + orden.getCodigo());
        eventoInicio.setUsuario(usuario);
        eventoInicio.setDetalles("Orden de producción iniciada por " + usuario.getNombre());
        loteEventoRepository.save(eventoInicio);
        
        orden.setEstado("EN_PRODUCCION");
        orden.setFechaInicio(ahora);
        ordenProduccionRepository.save(orden);
        
        lote.getEventos().size();
        return lote.getDTO();
    }
}
