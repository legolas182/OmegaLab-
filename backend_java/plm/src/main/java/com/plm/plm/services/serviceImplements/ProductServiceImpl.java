package com.plm.plm.services.serviceImplements;

import com.plm.plm.Config.exception.BadRequestException;
import com.plm.plm.Config.exception.DuplicateResourceException;
import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoBOM;
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Models.BOM;
import com.plm.plm.Models.BOMItem;
import com.plm.plm.Models.Material;
import com.plm.plm.Models.Product;
import com.plm.plm.Models.User;
import com.plm.plm.Reposotory.BOMItemRepository;
import com.plm.plm.Reposotory.BOMRepository;
import com.plm.plm.Reposotory.CategoryRepository;
import com.plm.plm.Reposotory.MaterialRepository;
import com.plm.plm.Reposotory.ProductRepository;
import com.plm.plm.Reposotory.UserRepository;
import com.plm.plm.dto.BOMDTO;
import com.plm.plm.dto.BOMItemDTO;
import com.plm.plm.dto.ProductDTO;
import com.plm.plm.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Types;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BOMRepository bomRepository;

    @Autowired
    private BOMItemRepository bomItemRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        validateProductData(productDTO.getCodigo(), productDTO.getNombre());

        if (productDTO.getNombre() != null && productRepository.existsByNombre(productDTO.getNombre())) {
            throw new DuplicateResourceException("El nombre del producto ya existe");
        }
        Product product = new Product();
        product.setCodigo(productDTO.getCodigo());
        product.setNombre(productDTO.getNombre());
        product.setDescripcion(productDTO.getDescripcion() != null ? productDTO.getDescripcion() : "");
        product.setUnidadMedida(productDTO.getUnidadMedida() != null ? productDTO.getUnidadMedida() : "un");
        
        if (productDTO.getCategoriaId() != null) {
            product.setCategoriaEntity(categoryRepository.findById(productDTO.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada")));
        }
        
        product.setEstado(productDTO.getEstado() != null ? productDTO.getEstado() : EstadoUsuario.ACTIVO);

        return productRepository.save(product).getDTO();
    }

    private void validateProductData(String codigo, String nombre) {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new BadRequestException("El código del producto es requerido");
        }

        if (nombre == null || nombre.trim().isEmpty()) {
            throw new BadRequestException("El nombre del producto es requerido");
        }

        if (nombre.trim().length() < 2) {
            throw new BadRequestException("El nombre debe tener al menos 2 caracteres");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts(String tipo, String categoria, String search) {
        List<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByNombreOrCodigoContaining(
                search.trim(),
                EstadoUsuario.ACTIVO
            );
        } else if (categoria != null) {
            // Buscar por nombre de categoría a través de la relación
            products = productRepository.findAll()
                .stream()
                .filter(p -> p.getEstado() == EstadoUsuario.ACTIVO && 
                            p.getCategoriaEntity() != null && 
                            p.getCategoriaEntity().getNombre().equalsIgnoreCase(categoria))
                .collect(Collectors.toList());
        } else {
            products = productRepository.findAll()
                .stream()
                .filter(p -> p.getEstado() == EstadoUsuario.ACTIVO)
                .collect(Collectors.toList());
        }
        
        return products.stream()
                .map(Product::getDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getProductById(Integer id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (product.getEstado() != EstadoUsuario.ACTIVO) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        BOM bom = bomRepository.findFirstByProductoIdAndEstadoOrderByVersionDesc(
            id, EstadoBOM.APROBADO
        ).orElse(null);

        if (bom == null) {
            bom = bomRepository.findFirstByProductoIdAndEstadoOrderByVersionDesc(
                id, EstadoBOM.BORRADOR
            ).orElse(null);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("product", product.getDTO());
        
        if (bom != null) {
            List<BOMItem> items = bomItemRepository.findByBomIdOrderBySecuenciaAsc(bom.getId());
            bom.setItems(items);
            result.put("bom", bom.getDTO());
        } else {
            result.put("bom", null);
        }

        return result;
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Integer id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (product.getEstado() != EstadoUsuario.ACTIVO) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        if (productDTO.getCodigo() != null && !productDTO.getCodigo().trim().isEmpty()) {
            if (!productDTO.getCodigo().equals(product.getCodigo()) && 
                productRepository.existsByCodigo(productDTO.getCodigo())) {
                throw new DuplicateResourceException("El código del producto ya existe");
            }
            product.setCodigo(productDTO.getCodigo());
        }

        if (productDTO.getNombre() != null && !productDTO.getNombre().trim().isEmpty()) {
            if (productDTO.getNombre().trim().length() < 2) {
                throw new BadRequestException("El nombre debe tener al menos 2 caracteres");
            }
            if (!productDTO.getNombre().equals(product.getNombre()) && 
                productRepository.existsByNombre(productDTO.getNombre())) {
                throw new DuplicateResourceException("El nombre del producto ya existe");
            }
            product.setNombre(productDTO.getNombre());
        }

        if (productDTO.getDescripcion() != null) {
            product.setDescripcion(productDTO.getDescripcion());
        }
        
        if (productDTO.getUnidadMedida() != null && !productDTO.getUnidadMedida().trim().isEmpty()) {
            product.setUnidadMedida(productDTO.getUnidadMedida());
        }

        if (productDTO.getCategoriaId() != null) {
            product.setCategoriaEntity(categoryRepository.findById(productDTO.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada")));
        }

        if (productDTO.getEstado() != null) {
            product.setEstado(productDTO.getEstado());
        }

        return productRepository.save(product).getDTO();
    }

    @Override
    @Transactional
    public BOMDTO createOrUpdateBOM(Integer productoId, String justificacion, Integer userId) {
        Product product = productRepository.findById(productoId)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        BOM bom = bomRepository.findByProductoIdAndEstado(productoId, EstadoBOM.BORRADOR)
            .stream()
            .findFirst()
            .orElse(null);

        List<BOM> lastBoms = bomRepository.findByProductoIdOrderByVersionDesc(productoId);
        String version = lastBoms.isEmpty() ? "1.0" : getNextVersion(lastBoms.get(0).getVersion());

        bom = new BOM();
        bom.setProducto(product);
        bom.setVersion(version);
        bom.setJustificacion(justificacion);
        bom.setEstado(EstadoBOM.BORRADOR);
        User creador = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        bom.setCreador(creador);

        return bomRepository.save(bom).getDTO();
    }

    @Override
    @Transactional
    public BOMItemDTO addMaterialToBOM(Integer bomId, Integer materialId, BigDecimal cantidad, String unidad, BigDecimal porcentaje) {
        if (materialId == null) {
            throw new BadRequestException("El ID del material es requerido");
        }
        
        if (bomId == null) {
            throw new BadRequestException("El ID del BOM es requerido");
        }
        
        BOM bom = bomRepository.findById(bomId)
            .orElseThrow(() -> new ResourceNotFoundException("BOM no encontrado"));

        Material material = materialRepository.findById(materialId)
            .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        Integer maxSeq = bomItemRepository.findMaxSecuenciaByBomId(bomId);
        Integer nextSeq = (maxSeq != null ? maxSeq : 0) + 1;

        BOMItem item = new BOMItem();
        item.setBom(bom);
        item.setMaterial(material);
        item.setCantidad(cantidad);
        item.setUnidad(unidad);
        item.setPorcentaje(porcentaje);
        item.setSecuencia(nextSeq);

        BOMItemDTO savedItem = bomItemRepository.save(item).getDTO();
        
        // Validar porcentajes después de agregar el item usando procedimiento almacenado
        validateBOMPercentages(bomId);
        
        return savedItem;
    }

    @Override
    @Transactional(readOnly = true)
    public BOMDTO getBOMWithItems(Integer bomId) {
        BOM bom = bomRepository.findById(bomId)
            .orElseThrow(() -> new ResourceNotFoundException("BOM no encontrado"));

        List<BOMItem> items = bomItemRepository.findByBomIdOrderBySecuenciaAsc(bomId);
        bom.setItems(items);

        return bom.getDTO();
    }

    @Override
    @Transactional
    public BOMItemDTO updateBOMItem(Integer itemId, Integer materialId, BigDecimal cantidad, String unidad, BigDecimal porcentaje) {
        BOMItem item = bomItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));

        Material material = materialRepository.findById(materialId)
            .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado"));

        item.setMaterial(material);
        item.setCantidad(cantidad);
        item.setUnidad(unidad);
        item.setPorcentaje(porcentaje);

        BOMItemDTO savedItem = bomItemRepository.save(item).getDTO();
        
        // Validar porcentajes después de actualizar el item usando procedimiento almacenado
        validateBOMPercentages(item.getBom().getId());
        
        return savedItem;
    }

    @Override
    @Transactional
    public void deleteBOMItem(Integer itemId) {
        BOMItem item = bomItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));

        Integer bomId = item.getBom().getId();
        bomItemRepository.delete(item);
        
        // Validar porcentajes después de eliminar el item usando procedimiento almacenado
        validateBOMPercentages(bomId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BOMDTO> getBOMHistory(Integer productoId) {
        return bomRepository.findByProductoIdOrderByVersionDesc(productoId)
                .stream()
                .map(BOM::getDTO)
                .collect(Collectors.toList());
    }

    private String getNextVersion(String currentVersion) {
        String[] parts = currentVersion.split("\\.");
        int major = parts.length > 0 ? Integer.parseInt(parts[0]) : 1;
        int minor = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        return major + "." + (minor + 1);
    }

    /**
     * Valida que los porcentajes de un BOM sumen 100% usando procedimiento almacenado
     */
    private void validateBOMPercentages(Integer bomId) {
        SimpleJdbcCall call = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("ValidarPorcentajesBOM")
                .declareParameters(
                        new SqlParameter("p_bom_id", Types.INTEGER),
                        new SqlOutParameter("p_valido", Types.BOOLEAN),
                        new SqlOutParameter("p_suma_total", Types.DECIMAL),
                        new SqlOutParameter("p_mensaje", Types.VARCHAR)
                );

        Map<String, Object> inParams = new HashMap<>();
        inParams.put("p_bom_id", bomId);

        Map<String, Object> result = call.execute(inParams);

        Boolean isValid = (Boolean) result.get("p_valido");
        BigDecimal totalSum = (BigDecimal) result.get("p_suma_total");
        String message = (String) result.get("p_mensaje");

        if (!isValid) {
            throw new BadRequestException(
                String.format("BOM percentages do not sum to 100%%. Current sum: %s%%. %s", 
                    totalSum, message)
            );
        }
    }

    /**
     * Valida los porcentajes de un BOM y retorna información detallada
     */
    @Override
    public Map<String, Object> validateBOM(Integer bomId) {
        SimpleJdbcCall call = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("ValidarPorcentajesBOM")
                .declareParameters(
                        new SqlParameter("p_bom_id", Types.INTEGER),
                        new SqlOutParameter("p_valido", Types.BOOLEAN),
                        new SqlOutParameter("p_suma_total", Types.DECIMAL),
                        new SqlOutParameter("p_mensaje", Types.VARCHAR)
                );

        Map<String, Object> inParams = new HashMap<>();
        inParams.put("p_bom_id", bomId);

        Map<String, Object> result = call.execute(inParams);

        Map<String, Object> response = new HashMap<>();
        response.put("valido", result.get("p_valido"));
        response.put("sumaTotal", result.get("p_suma_total"));
        response.put("mensaje", result.get("p_mensaje"));

        return response;
    }

    /**
     * Verifica si hay stock suficiente para producir un producto usando procedimiento almacenado
     */
    @Override
    public Map<String, Object> verifyStockProduction(Integer productoId, BigDecimal cantidad) {
        SimpleJdbcCall call = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("VerificarStockProduccion")
                .declareParameters(
                        new SqlParameter("p_producto_id", Types.INTEGER),
                        new SqlParameter("p_cantidad_producir", Types.DECIMAL),
                        new SqlOutParameter("p_disponible", Types.BOOLEAN),
                        new SqlOutParameter("p_mensaje", Types.CLOB)
                );

        Map<String, Object> inParams = new HashMap<>();
        inParams.put("p_producto_id", productoId);
        inParams.put("p_cantidad_producir", cantidad);

        Map<String, Object> result = call.execute(inParams);

        Map<String, Object> response = new HashMap<>();
        response.put("disponible", result.get("p_disponible"));
        response.put("mensaje", result.get("p_mensaje"));

        return response;
    }

    /**
     * Calcula los totales de un BOM usando procedimiento almacenado
     */
    @Override
    public Map<String, Object> calculateBOMTotals(Integer bomId) {
        SimpleJdbcCall call = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("CalcularTotalesBOM")
                .declareParameters(
                        new SqlParameter("p_bom_id", Types.INTEGER),
                        new SqlOutParameter("p_total_porcentaje", Types.DECIMAL),
                        new SqlOutParameter("p_total_cantidad", Types.DECIMAL),
                        new SqlOutParameter("p_num_items", Types.INTEGER),
                        new SqlOutParameter("p_detalle", Types.CLOB)
                );

        Map<String, Object> inParams = new HashMap<>();
        inParams.put("p_bom_id", bomId);

        Map<String, Object> result = call.execute(inParams);

        Map<String, Object> response = new HashMap<>();
        response.put("totalPorcentaje", result.get("p_total_porcentaje"));
        response.put("totalCantidad", result.get("p_total_cantidad"));
        response.put("numItems", result.get("p_num_items"));
        response.put("detalle", result.get("p_detalle"));

        return response;
    }
}

