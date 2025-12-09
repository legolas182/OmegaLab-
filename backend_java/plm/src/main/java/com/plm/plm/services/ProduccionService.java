package com.plm.plm.services;

import com.plm.plm.dto.LoteDTO;
import com.plm.plm.dto.OrdenDetalleDTO;
import com.plm.plm.dto.OrdenProduccionDTO;

import java.util.List;

public interface ProduccionService {
    List<OrdenProduccionDTO> getOrdenesProduccion();
    OrdenProduccionDTO getOrdenById(Integer id);
    OrdenDetalleDTO getOrdenDetalle(Integer ordenId);
    LoteDTO generarLote(Integer ordenId, Integer userId);
}

