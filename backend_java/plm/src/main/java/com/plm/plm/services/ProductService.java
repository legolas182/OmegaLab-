package com.plm.plm.services;

import com.plm.plm.dto.BOMDTO;
import com.plm.plm.dto.BOMItemDTO;
import com.plm.plm.dto.ProductDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ProductService {
    ProductDTO createProduct(ProductDTO productDTO);
    List<ProductDTO> getAllProducts(String tipo, String categoria, String search);
    Map<String, Object> getProductById(Integer id);
    ProductDTO updateProduct(Integer id, ProductDTO productDTO);
    BOMDTO createOrUpdateBOM(Integer productoId, String justificacion, Integer userId);
    BOMItemDTO addMaterialToBOM(Integer bomId, Integer materialId, BigDecimal cantidad, String unidad, BigDecimal porcentaje);
    BOMDTO getBOMWithItems(Integer bomId);
    BOMItemDTO updateBOMItem(Integer itemId, Integer materialId, BigDecimal cantidad, String unidad, BigDecimal porcentaje);
    void deleteBOMItem(Integer itemId);
    List<BOMDTO> getBOMHistory(Integer productoId);
}

