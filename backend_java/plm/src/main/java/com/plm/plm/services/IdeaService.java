package com.plm.plm.services;

import com.plm.plm.Enums.EstadoIdea;
import com.plm.plm.dto.IdeaDTO;

import java.util.List;

public interface IdeaService {
    IdeaDTO createIdea(IdeaDTO ideaDTO, Integer userId);
    List<IdeaDTO> getAllIdeas(EstadoIdea estado, Integer categoriaId, String prioridad, String search);
    IdeaDTO getIdeaById(Integer id);
    IdeaDTO updateIdea(Integer id, IdeaDTO ideaDTO);
    void deleteIdea(Integer id);
    IdeaDTO changeEstado(Integer id, EstadoIdea nuevoEstado, Integer userId, Integer analistaId);
    IdeaDTO approveIdea(Integer id, Integer userId);
    IdeaDTO rejectIdea(Integer id, Integer userId);
    List<IdeaDTO> getIdeasAsignadas(Integer userId);
    IdeaDTO confirmarProduccion(Integer id, Integer supervisorCalidadId, Integer cantidad, Integer userId);
}

