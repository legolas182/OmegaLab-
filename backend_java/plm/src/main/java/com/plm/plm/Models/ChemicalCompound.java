package com.plm.plm.Models;

import com.plm.plm.dto.ChemicalCompoundDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "chemical_compounds",
    indexes = {
        @Index(name = "idx_name", columnList = "name"),
        @Index(name = "idx_formula", columnList = "formula"),
        @Index(name = "idx_source", columnList = "source, source_id"),
        @Index(name = "idx_inchi_key", columnList = "inchi_key"),
        @Index(name = "idx_cas_number", columnList = "cas_number")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_inchi_key", columnNames = "inchi_key")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChemicalCompound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 100)
    private String formula;

    @Column(name = "molecular_weight", precision = 10, scale = 4)
    private BigDecimal molecularWeight;

    @Column(columnDefinition = "TEXT")
    private String smiles;

    @Column(columnDefinition = "TEXT")
    private String inchi;

    @Column(name = "inchi_key", length = 27, unique = true)
    private String inchiKey;

    @Column(name = "cas_number", length = 50)
    private String casNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChemicalSource source;

    @Column(name = "source_id", nullable = false, length = 100)
    private String sourceId;

    // Propiedades fisicoquímicas
    @Column(name = "log_p", precision = 6, scale = 2)
    private BigDecimal logP;

    @Column(name = "log_s", precision = 6, scale = 2)
    private BigDecimal logS;

    @Column(name = "hbd")
    private Integer hbd; // Hydrogen bond donors

    @Column(name = "hba")
    private Integer hba; // Hydrogen bond acceptors

    @Column(name = "rotatable_bonds")
    private Integer rotatableBonds;

    @Column(name = "tpsa", precision = 8, scale = 2)
    private BigDecimal tpsa; // Topological Polar Surface Area

    @Column(columnDefinition = "TEXT")
    private String solubility;

    @Column(columnDefinition = "TEXT")
    private String stability;

    // Propiedades biológicas
    @Column(columnDefinition = "TEXT")
    private String bioactivity;

    @Column(name = "mechanism_of_action", columnDefinition = "TEXT")
    private String mechanismOfAction;

    // Disponibilidad
    @Column
    private Boolean purchasable = false;

    @Column(length = 255)
    private String vendor;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    // Metadata
    @Column(name = "additional_properties", columnDefinition = "JSON")
    private String additionalProperties;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @CreatedDate
    @Column(name = "cached_at", nullable = false, updatable = false)
    private LocalDateTime cachedAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ChemicalSource {
        PubChem, ChEMBL, DrugBank, ZINC
    }

    public ChemicalCompoundDTO getDTO() {
        ChemicalCompoundDTO dto = new ChemicalCompoundDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setFormula(formula);
        dto.setMolecularWeight(molecularWeight != null ? molecularWeight.doubleValue() : null);
        dto.setSmiles(smiles);
        dto.setInchi(inchi);
        dto.setInchiKey(inchiKey);
        dto.setCasNumber(casNumber);
        dto.setSource(source != null ? source.name() : null);
        dto.setSourceId(sourceId);
        dto.setLogP(logP != null ? logP.doubleValue() : null);
        dto.setLogS(logS != null ? logS.doubleValue() : null);
        dto.setHbd(hbd);
        dto.setHba(hba);
        dto.setRotatableBonds(rotatableBonds);
        dto.setTpsa(tpsa != null ? tpsa.doubleValue() : null);
        dto.setSolubility(solubility);
        dto.setStability(stability);
        dto.setBioactivity(bioactivity);
        dto.setMechanismOfAction(mechanismOfAction);
        dto.setPurchasable(purchasable);
        dto.setVendor(vendor);
        dto.setPrice(price != null ? price.doubleValue() : null);
        dto.setAdditionalProperties(additionalProperties);
        dto.setSourceUrl(sourceUrl);
        dto.setCachedAt(cachedAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}

