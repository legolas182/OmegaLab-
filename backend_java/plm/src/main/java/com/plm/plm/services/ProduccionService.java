package com.plm.plm.services;

import com.plm.plm.dto.DispensacionDTO;
import com.plm.plm.dto.LineClearanceDTO;
import com.plm.plm.dto.OrdenProduccionDTO;

import java.util.List;

public interface ProduccionService {
    List<OrdenProduccionDTO> getOrdenesProduccion();
    OrdenProduccionDTO getOrdenById(Integer id);
    DispensacionDTO getDispensacionByOrdenId(Integer ordenId);
    DispensacionDTO saveDispensacion(Integer ordenId, DispensacionDTO dispensacionDTO, Integer userId);
    LineClearanceDTO getLineClearanceByOrdenId(Integer ordenId);
    LineClearanceDTO saveLineClearance(Integer ordenId, LineClearanceDTO lineClearanceDTO, Integer userId);
}

