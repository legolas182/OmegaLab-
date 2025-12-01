package com.plm.plm.services;

import com.plm.plm.dto.MaterialDTO;
import com.plm.plm.dto.MaterialCompoundDTO;

import java.util.List;

public interface MaterialService {
    MaterialDTO createMaterial(MaterialDTO materialDTO);
    List<MaterialDTO> getAllMaterials();
    List<MaterialDTO> getMaterialsByCategoria(String categoria);
    MaterialDTO getMaterialById(Integer id);
    MaterialDTO updateMaterial(Integer id, MaterialDTO materialDTO);
    void deleteMaterial(Integer id);
    List<MaterialDTO> searchMaterials(String search);
    List<MaterialCompoundDTO> getMaterialCompounds(Integer materialId);
}

