package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.exception.BadRequestException;
import com.plm.plm.Config.exception.DuplicateResourceException;
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
            // Permitir categorías de tipo MATERIA_PRIMA o COMPONENTE
            if (category != null && 
                (category.getTipoProducto().name().equals("MATERIA_PRIMA") || 
                 category.getTipoProducto().name().equals("COMPONENTE"))) {
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
    public List<MaterialDTO> getMaterialsByTipo(String tipo) {
        return materialRepository.findByEstado(EstadoUsuario.ACTIVO)
                .stream()
                .filter(m -> {
                    if (m.getCategoriaEntity() == null || m.getCategoriaEntity().getTipoProducto() == null) {
                        return tipo.equals("MATERIA_PRIMA"); // Por defecto si no tiene categoría
                    }
                    String tipoProducto = m.getCategoriaEntity().getTipoProducto().name();
                    return tipoProducto.equals(tipo);
                })
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

    @Override
    @Transactional
    public MaterialCompoundDTO createMaterialCompound(Integer materialId, MaterialCompoundDTO compoundDTO) {
        // Verificar que el material existe
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        // Validar datos del compuesto
        if (compoundDTO.getNombreCompuesto() == null || compoundDTO.getNombreCompuesto().trim().isEmpty()) {
            throw new BadRequestException("El nombre del compuesto es requerido");
        }

        // Verificar si ya existe un compuesto con el mismo nombre para este material
        materialCompoundRepository.findByMaterialIdAndNombreCompuesto(materialId, compoundDTO.getNombreCompuesto())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Ya existe un compuesto con el nombre '" + 
                        compoundDTO.getNombreCompuesto() + "' para este material");
                });

        // Crear el compuesto
        MaterialCompound compound = new MaterialCompound();
        compound.setMaterial(material);
        compound.setNombreCompuesto(compoundDTO.getNombreCompuesto().trim());
        compound.setFormulaMolecular(compoundDTO.getFormulaMolecular());
        compound.setPesoMolecular(compoundDTO.getPesoMolecular());
        compound.setPorcentajeConcentracion(compoundDTO.getPorcentajeConcentracion());
        compound.setTipoCompuesto(compoundDTO.getTipoCompuesto());
        compound.setDescripcion(compoundDTO.getDescripcion());

        return materialCompoundRepository.save(compound).getDTO();
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
