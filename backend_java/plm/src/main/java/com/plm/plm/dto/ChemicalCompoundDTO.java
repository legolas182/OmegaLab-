package com.plm.plm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChemicalCompoundDTO {
    private Integer id;
    private String name;
    private String formula;
    private Double molecularWeight;
    private String smiles;
    private String inchi;
    private String inchiKey;
    private String casNumber;
    private String source; // "PubChem", "ChEMBL", "DrugBank", "ZINC"
    private String sourceId;
    
    // Propiedades fisicoquímicas
    private Double logP;
    private Double logS;
    private Integer hbd;
    private Integer hba;
    private Integer rotatableBonds;
    private Double tpsa;
    private String solubility;
    private String stability;
    
    // Propiedades biológicas
    private String bioactivity;
    private String mechanismOfAction;
    
    // Disponibilidad
    private Boolean purchasable;
    private String vendor;
    private Double price;
    
    // Metadata
    private String additionalProperties;
    private String sourceUrl;
    private LocalDateTime cachedAt;
    private LocalDateTime updatedAt;
}

