package com.plm.plm.services;

import com.plm.plm.dto.PruebaDTO;
import com.plm.plm.dto.ResultadoPruebaDTO;

import java.util.List;

public interface PruebaService {
    PruebaDTO createPrueba(PruebaDTO pruebaDTO, Integer userId);
    PruebaDTO getPruebaById(Integer id);
    List<PruebaDTO> getPruebasByIdeaId(Integer ideaId);
    List<PruebaDTO> getPruebasByAnalistaId(Integer analistaId);
    PruebaDTO updatePrueba(Integer id, PruebaDTO pruebaDTO);
    PruebaDTO addResultado(Integer pruebaId, ResultadoPruebaDTO resultadoDTO);
    void deletePrueba(Integer id);
}

