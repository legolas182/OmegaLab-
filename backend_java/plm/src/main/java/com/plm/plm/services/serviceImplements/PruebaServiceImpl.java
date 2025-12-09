package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.Exception.BadRequestException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoPrueba;
import com.plm.plm.Models.Idea;
import com.plm.plm.Models.Prueba;
import com.plm.plm.Models.ResultadoPrueba;
import com.plm.plm.Models.User;
import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.Reposotory.IdeaRepository;
import com.plm.plm.Reposotory.PruebaRepository;
import com.plm.plm.Reposotory.ResultadoPruebaRepository;
import com.plm.plm.Reposotory.UserRepository;
import com.plm.plm.dto.PruebaDTO;
import com.plm.plm.dto.ResultadoPruebaDTO;
import com.plm.plm.services.IdeaService;
import com.plm.plm.services.PruebaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PruebaServiceImpl implements PruebaService {

    @Autowired
    private PruebaRepository pruebaRepository;

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResultadoPruebaRepository resultadoPruebaRepository;

    @Autowired
    private IdeaService ideaService;

    @Override
    @Transactional
    public PruebaDTO createPrueba(PruebaDTO pruebaDTO, Integer userId) {
        validatePruebaData(pruebaDTO);

        Idea idea = ideaRepository.findById(pruebaDTO.getIdeaId())
                .orElseThrow(() -> new ResourceNotFoundException("Idea no encontrada"));

        User analista = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Prueba prueba = new Prueba();
        prueba.setIdea(idea);
        prueba.setCodigoMuestra(pruebaDTO.getCodigoMuestra());
        prueba.setTipoPrueba(pruebaDTO.getTipoPrueba());
        prueba.setDescripcion(pruebaDTO.getDescripcion());
        prueba.setEstado(pruebaDTO.getEstado() != null ? pruebaDTO.getEstado() : EstadoPrueba.PENDIENTE);
        prueba.setFechaMuestreo(pruebaDTO.getFechaMuestreo());
        prueba.setFechaInicio(pruebaDTO.getFechaInicio());
        prueba.setFechaFin(pruebaDTO.getFechaFin());
        prueba.setResultado(pruebaDTO.getResultado());
        prueba.setObservaciones(pruebaDTO.getObservaciones());
        prueba.setEquiposUtilizados(pruebaDTO.getEquiposUtilizados());
        prueba.setPruebasRequeridas(pruebaDTO.getPruebasRequeridas());
        prueba.setAnalista(analista);

        return pruebaRepository.save(prueba).getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public PruebaDTO getPruebaById(Integer id) {
        Prueba prueba = pruebaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prueba no encontrada"));
        

        if (prueba.getIdea() != null) {
            prueba.getIdea().getId();
            if (prueba.getIdea().getEstado() != null) {
                prueba.getIdea().getEstado();
            }
        }

        if (prueba.getResultados() != null) {
            prueba.getResultados().size();
        }
        
        return prueba.getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PruebaDTO> getPruebasByIdeaId(Integer ideaId) {
        return pruebaRepository.findByIdeaId(ideaId).stream()
                .map(prueba -> {
                    if (prueba.getIdea() != null) {
                        prueba.getIdea().getId();
                        if (prueba.getIdea().getEstado() != null) {
                            prueba.getIdea().getEstado();
                        }
                    }
                    return prueba.getDTO();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PruebaDTO> getPruebasByAnalistaId(Integer analistaId) {
        return pruebaRepository.findByAnalistaId(analistaId).stream()
                .map(prueba -> {
                    if (prueba.getIdea() != null) {
                        prueba.getIdea().getId();
                        if (prueba.getIdea().getEstado() != null) {
                            prueba.getIdea().getEstado();
                        }
                    }
                    return prueba.getDTO();
                })
                .toList();
    }

    @Override
    @Transactional
    public PruebaDTO updatePrueba(Integer id, PruebaDTO pruebaDTO) {
        Prueba prueba = pruebaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prueba no encontrada"));

        if (pruebaDTO.getTipoPrueba() != null) {
            prueba.setTipoPrueba(pruebaDTO.getTipoPrueba());
        }
        if (pruebaDTO.getDescripcion() != null) {
            prueba.setDescripcion(pruebaDTO.getDescripcion());
        }
        if (pruebaDTO.getEstado() != null) {
            EstadoPrueba estadoAnterior = prueba.getEstado();
            prueba.setEstado(pruebaDTO.getEstado());
            if ((pruebaDTO.getEstado() == EstadoPrueba.COMPLETADA || 
                 pruebaDTO.getEstado() == EstadoPrueba.OOS || 
                 pruebaDTO.getEstado() == EstadoPrueba.RECHAZADA) &&
                prueba.getFechaFin() == null) {
                prueba.setFechaFin(LocalDateTime.now());
            }
        }
        if (pruebaDTO.getFechaMuestreo() != null) {
            prueba.setFechaMuestreo(pruebaDTO.getFechaMuestreo());
        }
        if (pruebaDTO.getFechaInicio() != null) {
            prueba.setFechaInicio(pruebaDTO.getFechaInicio());
        }
        if (pruebaDTO.getFechaFin() != null) {
            prueba.setFechaFin(pruebaDTO.getFechaFin());
        }
        if (pruebaDTO.getResultado() != null) {
            prueba.setResultado(pruebaDTO.getResultado());
        }
        if (pruebaDTO.getObservaciones() != null) {
            prueba.setObservaciones(pruebaDTO.getObservaciones());
        }
        if (pruebaDTO.getEquiposUtilizados() != null) {
            prueba.setEquiposUtilizados(pruebaDTO.getEquiposUtilizados());
        }
        if (pruebaDTO.getPruebasRequeridas() != null) {
            prueba.setPruebasRequeridas(pruebaDTO.getPruebasRequeridas());
        }

        Prueba pruebaGuardada = pruebaRepository.save(prueba);
        
        // Si el estado de la prueba cambió a COMPLETADA u OOS, verificar si todas las pruebas de la idea están completadas
        if (pruebaDTO.getEstado() != null && 
            (pruebaDTO.getEstado() == EstadoPrueba.COMPLETADA || pruebaDTO.getEstado() == EstadoPrueba.OOS || pruebaDTO.getEstado() == EstadoPrueba.RECHAZADA)) {
            sincronizarEstadoIdea(pruebaGuardada.getIdea().getId());
        }
        
        return pruebaGuardada.getDTO();
    }
    

    private void sincronizarEstadoIdea(Integer ideaId) {
        try {
            // Obtener todas las pruebas asociadas a la idea
            List<Prueba> pruebasDeIdea = pruebaRepository.findByIdeaId(ideaId);
            
            if (pruebasDeIdea.isEmpty()) {
                System.out.println("Sincronización: Idea " + ideaId + " no tiene pruebas asociadas");
                return; // No hay pruebas, no hacer nada
            }
            
            System.out.println("Sincronización: Idea " + ideaId + " tiene " + pruebasDeIdea.size() + " prueba(s)");
            
            // Verificar si todas las pruebas están completadas (COMPLETADA, OOS o RECHAZADA)
            boolean todasCompletadas = pruebasDeIdea.stream()
                    .allMatch(p -> p.getEstado() == EstadoPrueba.COMPLETADA || 
                                  p.getEstado() == EstadoPrueba.OOS || 
                                  p.getEstado() == EstadoPrueba.RECHAZADA);
            
            System.out.println("Sincronización: Todas las pruebas completadas: " + todasCompletadas);
            
            if (todasCompletadas) {
                // Verificar si todas las pruebas pasaron
                boolean todasPasaron = pruebasDeIdea.stream()
                        .allMatch(p -> p.getEstado() == EstadoPrueba.COMPLETADA);
                
                // Verificar si alguna falló
                boolean algunaFallo = pruebasDeIdea.stream()
                        .anyMatch(p -> p.getEstado() == EstadoPrueba.OOS || p.getEstado() == EstadoPrueba.RECHAZADA);
                
                System.out.println("Sincronización: Todas pasaron: " + todasPasaron + ", Alguna falló: " + algunaFallo);
                
                // Obtener la idea para verificar su estado actual
                com.plm.plm.Models.Idea idea = ideaRepository.findById(ideaId)
                        .orElse(null);
                
                if (idea == null) {
                    System.err.println("Sincronización: Idea " + ideaId + " no encontrada");
                    return;
                }
                
                System.out.println("Sincronización: Estado actual de idea " + ideaId + ": " + idea.getEstado());
                
                // Solo actualizar si está en EN_PRUEBA (no actualizar si ya está en otro estado final)
                if (idea.getEstado() == EstadoIdea.EN_PRUEBA) {
                    // Obtener el usuario asignado a la idea (analista) para usar como userId
                    // Si no hay usuario asignado, usar el creador de la idea
                    Integer userId = idea.getAsignadoA() != null ? idea.getAsignadoA().getId() : 
                                    (idea.getCreador() != null ? idea.getCreador().getId() : null);
                    
                    // Determinar el nuevo estado basado en los resultados de las pruebas
                    EstadoIdea nuevoEstado = todasPasaron ? EstadoIdea.PRUEBA_APROBADA : EstadoIdea.RECHAZADA;
                    
                    if (todasPasaron && idea.getCantidadSugerida() == null) {
                        idea.setCantidadSugerida(java.math.BigDecimal.valueOf(1000.0));
                    }
                    
                    if (userId == null) {
                        // Si no hay usuario disponible, cambiar el estado directamente sin userId
                        idea.setEstado(nuevoEstado);
                        ideaRepository.save(idea);
                        System.out.println("Sincronización: Estado de idea " + ideaId + " actualizado a " + nuevoEstado.getValor() + " (sin userId)");
                    } else {
                        // Usar el servicio para cambiar el estado (mantiene consistencia)
                        ideaService.changeEstado(ideaId, nuevoEstado, userId, null);
                        idea.setCantidadSugerida(idea.getCantidadSugerida());
                        ideaRepository.save(idea);
                        System.out.println("Sincronización: Estado de idea " + ideaId + " actualizado a " + nuevoEstado.getValor() + " (con userId: " + userId + ")");
                    }
                } else {
                    System.out.println("Sincronización: Idea " + ideaId + " está en estado " + idea.getEstado() + ", no se actualiza (solo se actualiza desde EN_PRUEBA)");
                }
            } else {
                System.out.println("Sincronización: No todas las pruebas están completadas, esperando...");
            }
        } catch (Exception e) {
            // Log el error pero no interrumpir el flujo
            System.err.println("Error al sincronizar estado de idea " + ideaId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public PruebaDTO addResultado(Integer pruebaId, ResultadoPruebaDTO resultadoDTO) {
        Prueba prueba = pruebaRepository.findById(pruebaId)
                .orElseThrow(() -> new ResourceNotFoundException("Prueba no encontrada"));

        ResultadoPrueba resultado = new ResultadoPrueba();
        resultado.setPrueba(prueba);
        resultado.setParametro(resultadoDTO.getParametro());
        resultado.setEspecificacion(resultadoDTO.getEspecificacion());
        resultado.setResultado(resultadoDTO.getResultado());
        resultado.setUnidad(resultadoDTO.getUnidad());
        resultado.setCumpleEspecificacion(resultadoDTO.getCumpleEspecificacion() != null ? resultadoDTO.getCumpleEspecificacion() : true);
        resultado.setObservaciones(resultadoDTO.getObservaciones());
        
        // Establecer created_at manualmente (la auditoría puede no funcionar en todos los casos)
        resultado.setCreatedAt(LocalDateTime.now());

        resultadoPruebaRepository.save(resultado);

        Prueba pruebaActualizada = pruebaRepository.findById(pruebaId)
                .orElseThrow(() -> new ResourceNotFoundException("Prueba no encontrada"));
        
        // Forzar la carga de la relación con la idea
        if (pruebaActualizada.getIdea() != null) {
            pruebaActualizada.getIdea().getId(); // Acceder para forzar la carga
            if (pruebaActualizada.getIdea().getEstado() != null) {
                pruebaActualizada.getIdea().getEstado(); // Acceder al estado
            }
            
            // Verificar si la prueba debería cambiar de estado automáticamente
            // Esto se hace en el frontend, pero también verificamos aquí por si acaso
            // Si la prueba está en EN_PROCESO y tiene resultados, el frontend la actualizará
        }
        
        return pruebaActualizada.getDTO();
    }

    @Override
    @Transactional
    public void deletePrueba(Integer id) {
        Prueba prueba = pruebaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prueba no encontrada"));
        pruebaRepository.delete(prueba);
    }

    private void validatePruebaData(PruebaDTO pruebaDTO) {
        if (pruebaDTO.getIdeaId() == null) {
            throw new BadRequestException("El ID de la idea es requerido");
        }
        if (pruebaDTO.getCodigoMuestra() == null || pruebaDTO.getCodigoMuestra().trim().isEmpty()) {
            throw new BadRequestException("El código de muestra es requerido");
        }
        if (pruebaDTO.getTipoPrueba() == null || pruebaDTO.getTipoPrueba().trim().isEmpty()) {
            throw new BadRequestException("El tipo de prueba es requerido");
        }
    }
}

