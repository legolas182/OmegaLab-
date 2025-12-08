package com.plm.plm.services;

import com.plm.plm.dto.ChemicalCompoundDTO;

import java.util.List;
import java.util.Map;

public interface ChemicalDatabaseService {
    
    /**
     * Búsqueda en PubChem
     */
    List<ChemicalCompoundDTO> searchPubChem(String query, SearchType type);
    
    /**
     * Búsqueda en ChEMBL
     */
    List<ChemicalCompoundDTO> searchChEMBL(String query, SearchType type);
    
    /**
     * Búsqueda en DrugBank (requiere autenticación)
     */
    List<ChemicalCompoundDTO> searchDrugBank(String query, SearchType type);
    
    /**
     * Búsqueda en ZINC (limitado, principalmente descargas)
     */
    List<ChemicalCompoundDTO> searchZINC(String query, SearchType type);
    
    /**
     * Búsqueda unificada en todas las bases de datos
     */
    Map<String, List<ChemicalCompoundDTO>> searchAll(String query, SearchType type);
    
    /**
     * Obtener detalles completos de un compuesto
     */
    ChemicalCompoundDTO getCompoundDetails(String source, String sourceId);
    
    /**
     * Obtener compuesto desde cache local
     */
    ChemicalCompoundDTO getCachedCompound(String inchiKey);
    
    /**
     * Guardar compuesto en cache local
     */
    ChemicalCompoundDTO saveToCache(ChemicalCompoundDTO compound);
    
    enum SearchType {
        NAME,           // Por nombre
        FORMULA,        // Por fórmula molecular
        SMILES,         // Por SMILES
        CAS,            // Por número CAS
        INCHI_KEY,      // Por InChI Key
        PROPERTIES      // Por propiedades
    }
}

