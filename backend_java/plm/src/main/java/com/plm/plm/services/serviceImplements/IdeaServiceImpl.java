package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.Exception.BadRequestException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.Models.Idea;
import com.plm.plm.Models.User;
import com.plm.plm.Models.Product;
import com.plm.plm.Models.Category;
import com.plm.plm.Reposotory.IdeaRepository;
import com.plm.plm.Reposotory.ProductRepository;
import com.plm.plm.Reposotory.UserRepository;
import com.plm.plm.Reposotory.CategoryRepository;
import com.plm.plm.Reposotory.OrdenProduccionRepository;
import com.plm.plm.Models.OrdenProduccion;
import java.math.BigDecimal;
import com.plm.plm.dto.IdeaDTO;
import com.plm.plm.services.IdeaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IdeaServiceImpl implements IdeaService {

    @Autowired
    private IdeaRepository ideaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrdenProduccionRepository ordenProduccionRepository;

    @Override
    @Transactional
    public IdeaDTO createIdea(IdeaDTO ideaDTO, Integer userId) {
        validateIdeaData(ideaDTO);

        User creador = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Idea idea = new Idea();
        idea.setTitulo(ideaDTO.getTitulo());
        idea.setDescripcion(ideaDTO.getDescripcion());
        idea.setDetallesIA(ideaDTO.getDetallesIA());
        idea.setPruebasRequeridas(ideaDTO.getPruebasRequeridas());
        
        // Establecer categoría si se proporciona categoriaId
        if (ideaDTO.getCategoriaId() != null) {
            Category categoria = categoryRepository.findById(ideaDTO.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            idea.setCategoriaEntity(categoria);
        }
        
        idea.setPrioridad(ideaDTO.getPrioridad() != null ? ideaDTO.getPrioridad() : "Media");
        idea.setObjetivo(ideaDTO.getObjetivo());
        idea.setEstado(EstadoIdea.GENERADA);
        idea.setCreador(creador);
        
        // Si hay producto origen, establecerlo
        if (ideaDTO.getProductoOrigenId() != null) {
            Product productoOrigen = productRepository.findById(ideaDTO.getProductoOrigenId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto origen no encontrado con ID: " + ideaDTO.getProductoOrigenId()));
            idea.setProductoOrigen(productoOrigen);
            // Si no hay categoriaId pero el producto tiene categoría, usar la categoría del producto
            if (ideaDTO.getCategoriaId() == null && productoOrigen.getCategoriaEntity() != null) {
                idea.setCategoriaEntity(productoOrigen.getCategoriaEntity());
            }
        }
        
        return ideaRepository.save(idea).getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IdeaDTO> getAllIdeas(EstadoIdea estado, Integer categoriaId, String prioridad, String search) {
        List<Idea> ideas = ideaRepository.findByFilters(estado, categoriaId, prioridad, search);
        return ideas.stream()
                .map(Idea::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public IdeaDTO getIdeaById(Integer id) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea no encontrada"));
        return idea.getDTO();
    }

    @Override
    @Transactional
    public IdeaDTO updateIdea(Integer id, IdeaDTO ideaDTO) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea no encontrada"));

        // Solo se puede editar si está en generada o en revisión
        if (idea.getEstado() != EstadoIdea.GENERADA && idea.getEstado() != EstadoIdea.EN_REVISION) {
            throw new BadRequestException("No se puede editar una idea que no está en estado Generada o En Revisión");
        }

        validateIdeaData(ideaDTO);

        idea.setTitulo(ideaDTO.getTitulo());
        idea.setDescripcion(ideaDTO.getDescripcion());
        
        // Actualizar categoría si se proporciona categoriaId
        if (ideaDTO.getCategoriaId() != null) {
            Category categoria = categoryRepository.findById(ideaDTO.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            idea.setCategoriaEntity(categoria);
        }
        
        if (ideaDTO.getPrioridad() != null) {
            idea.setPrioridad(ideaDTO.getPrioridad());
        }
        if (ideaDTO.getObjetivo() != null) {
            idea.setObjetivo(ideaDTO.getObjetivo());
        }

        return ideaRepository.save(idea).getDTO();
    }

    @Override
    @Transactional
    public void deleteIdea(Integer id) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea no encontrada"));

        // Solo se puede eliminar si está en generada o rechazada
        if (idea.getEstado() != EstadoIdea.GENERADA && idea.getEstado() != EstadoIdea.RECHAZADA) {
            throw new BadRequestException("Solo se pueden eliminar ideas en estado Generada o Rechazada");
        }

        ideaRepository.delete(idea);
    }

    @Override
    @Transactional
    public IdeaDTO changeEstado(Integer id, EstadoIdea nuevoEstado, Integer userId, Integer analistaId) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea no encontrada"));

        // Permitir cualquier transición de estado según la etapa
        // No se valida la transición para permitir flexibilidad en el flujo de trabajo
        idea.setEstado(nuevoEstado);

        // Si se aprueba, registrar aprobador y fecha
        if (nuevoEstado == EstadoIdea.APROBADA) {
            User aprobador = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            idea.setAprobador(aprobador);
            idea.setApprovedAt(LocalDateTime.now());
        }

        // Si se envía a pruebas, asignar analista (solo si se proporciona)
        if (nuevoEstado == EstadoIdea.EN_PRUEBA && analistaId != null) {
            User analista = userRepository.findById(analistaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Analista no encontrado"));
            idea.setAsignadoA(analista);
        }

        return ideaRepository.save(idea).getDTO();
    }

    @Override
    @Transactional
    public IdeaDTO approveIdea(Integer id, Integer userId) {
        return changeEstado(id, EstadoIdea.APROBADA, userId, null);
    }

    @Override
    @Transactional
    public IdeaDTO rejectIdea(Integer id, Integer userId) {
        return changeEstado(id, EstadoIdea.RECHAZADA, userId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IdeaDTO> getIdeasAsignadas(Integer userId) {
        return ideaRepository.findByAsignadoAId(userId).stream()
                .map(Idea::getDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IdeaDTO> getOrdenesProduccionAsignadas(Integer supervisorCalidadId) {
        return ideaRepository.findByAsignadoAIdAndEstado(supervisorCalidadId, EstadoIdea.EN_PRODUCCION).stream()
                .map(Idea::getDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public IdeaDTO confirmarProduccion(Integer id, Integer supervisorCalidadId, Integer cantidad, Integer userId) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Idea no encontrada"));

        // Validar que la idea esté en estado PRUEBA_APROBADA
        if (idea.getEstado() != EstadoIdea.PRUEBA_APROBADA) {
            throw new BadRequestException("Solo se pueden confirmar para producción las fórmulas que han pasado las pruebas");
        }

        // Validar que se proporcione un supervisor de calidad
        if (supervisorCalidadId == null) {
            throw new BadRequestException("Debe asignar un supervisor de calidad");
        }

        // Validar que se proporcione una cantidad
        if (cantidad == null || cantidad <= 0) {
            throw new BadRequestException("Debe especificar una cantidad válida para producción");
        }

        // Asignar supervisor de calidad (usando el campo asignadoA)
        User supervisor = userRepository.findById(supervisorCalidadId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor de calidad no encontrado"));
        idea.setAsignadoA(supervisor);

        // Cambiar estado a EN_PRODUCCION
        idea.setEstado(EstadoIdea.EN_PRODUCCION);

        // Registrar aprobador y fecha
        User aprobador = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        idea.setAprobador(aprobador);
        LocalDateTime ahora = LocalDateTime.now();
        idea.setApprovedAt(ahora);
        
        idea = ideaRepository.save(idea);
        
        // Crear orden de producción con la cantidad especificada por QA
        List<OrdenProduccion> ordenesExistentes = ordenProduccionRepository.findByIdeaId(idea.getId());
        if (ordenesExistentes.isEmpty()) {
            OrdenProduccion orden = new OrdenProduccion();
            orden.setCodigo("OP-" + idea.getId());
            orden.setIdea(idea);
            orden.setCantidad(BigDecimal.valueOf(cantidad));
            orden.setEstado("EN_PROCESO");
            orden.setSupervisorCalidad(supervisor);
            orden.setFechaInicio(ahora);
            ordenProduccionRepository.save(orden);
        }

        return ideaRepository.save(idea).getDTO();
    }

    private void validateIdeaData(IdeaDTO ideaDTO) {
        if (ideaDTO.getTitulo() == null || ideaDTO.getTitulo().trim().isEmpty()) {
            throw new BadRequestException("El título de la idea es requerido");
        }
        if (ideaDTO.getDescripcion() == null || ideaDTO.getDescripcion().trim().isEmpty()) {
            throw new BadRequestException("La descripción es requerida");
        }
    }

    // Método removido - ya no se valida la transición de estados
    // Se permite cambiar libremente entre cualquier estado según la etapa del proceso
}

