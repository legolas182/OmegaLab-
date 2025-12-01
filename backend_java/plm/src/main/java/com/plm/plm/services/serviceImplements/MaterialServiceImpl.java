package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.Exception.BadRequestException;
import com.plm.plm.Config.Exception.DuplicateResourceException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Models.Category;
import com.plm.plm.Models.Material;
import com.plm.plm.Models.MaterialCompound;
import com.plm.plm.Reposotory.CategoryRepository;
import com.plm.plm.Reposotory.MaterialCompoundRepository;
import com.plm.plm.Reposotory.MaterialRepository;
import com.plm.plm.dto.MaterialDTO;
import com.plm.plm.dto.MaterialCompoundDTO;
import com.plm.plm.services.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialServiceImpl implements MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MaterialCompoundRepository materialCompoundRepository;

    @Override
    @Transactional
    public MaterialDTO createMaterial(MaterialDTO materialDTO) {
        validateMaterialData(materialDTO.getCodigo(), materialDTO.getNombre());

        if (materialDTO.getCodigo() != null && materialRepository.existsByCodigo(materialDTO.getCodigo())) {
            throw new DuplicateResourceException("El código del material ya existe");
        }

        Material material = new Material();
        material.setCodigo(materialDTO.getCodigo());
        material.setNombre(materialDTO.getNombre());
        material.setDescripcion(materialDTO.getDescripcion() != null ? materialDTO.getDescripcion() : "");
        material.setUnidadMedida(materialDTO.getUnidadMedida() != null ? materialDTO.getUnidadMedida() : "kg");
        material.setEstado(materialDTO.getEstado() != null ? materialDTO.getEstado() : EstadoUsuario.ACTIVO);

        if (materialDTO.getCategoriaId() != null) {
            Category category = categoryRepository.findById(materialDTO.getCategoriaId())
                .orElse(null);
            if (category != null && category.getTipoProducto().name().contains("MATERIA_PRIMA")) {
                material.setCategoriaEntity(category);
            }
        }

        return materialRepository.save(material).getDTO();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialDTO> getAllMaterials() {
        return materialRepository.findByEstado(EstadoUsuario.ACTIVO)
                .stream()
                .map(Material::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialDTO> getMaterialsByCategoria(String categoria) {
        return materialRepository.findByEstado(EstadoUsuario.ACTIVO)
                .stream()
                .filter(m -> m.getCategoriaEntity() != null && 
                            m.getCategoriaEntity().getNombre().equalsIgnoreCase(categoria))
                .map(Material::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialDTO getMaterialById(Integer id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        if (material.getEstado() != EstadoUsuario.ACTIVO) {
            throw new ResourceNotFoundException("Material no encontrado");
        }

        return material.getDTO();
    }

    @Override
    @Transactional
    public MaterialDTO updateMaterial(Integer id, MaterialDTO materialDTO) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        material.setCodigo(materialDTO.getCodigo());
        material.setNombre(materialDTO.getNombre());
        material.setDescripcion(materialDTO.getDescripcion());

        if (materialDTO.getCategoriaId() != null) {
            Category category = categoryRepository.findById(materialDTO.getCategoriaId()).orElse(null);
            material.setCategoriaEntity(category);
        }

        material.setUnidadMedida(materialDTO.getUnidadMedida());
        material.setEstado(materialDTO.getEstado());

        return materialRepository.save(material).getDTO();
    }

    @Override
    @Transactional
    public void deleteMaterial(Integer id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        material.setEstado(EstadoUsuario.INACTIVO);
        materialRepository.save(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialDTO> searchMaterials(String search) {
        return materialRepository.findByNombreOrCodigoContaining(
                search.trim(), EstadoUsuario.ACTIVO)
                .stream()
                .map(Material::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialCompoundDTO> getMaterialCompounds(Integer materialId) {
        // Verificar que el material existe
        materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));
        
        // Obtener todos los compuestos del material
        List<MaterialCompound> compounds = materialCompoundRepository.findByMaterialId(materialId);
        
        return compounds.stream()
                .map(MaterialCompound::getDTO)
                .collect(Collectors.toList());
    }

    private void validateMaterialData(String codigo, String nombre) {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new BadRequestException("El código del material es requerido");
        }

        if (nombre == null || nombre.trim().isEmpty()) {
            throw new BadRequestException("El nombre del material es requerido");
        }

        if (nombre.trim().length() < 2) {
            throw new BadRequestException("El nombre debe tener al menos 2 caracteres");
        }
    }
}
