package com.plm.plm.services.serviceImplements;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.util.concurrent.RateLimiter;
import com.plm.plm.Models.ChemicalCompound;
import com.plm.plm.Reposotory.ChemicalCompoundRepository;
import com.plm.plm.dto.ChemicalCompoundDTO;
import com.plm.plm.services.ChemicalDatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ChemicalDatabaseServiceImpl implements ChemicalDatabaseService {

    @Autowired
    private ChemicalCompoundRepository compoundRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Rate limiter: 4 requests por segundo (menos que el límite de 5 para seguridad)
    private final RateLimiter pubchemRateLimiter = RateLimiter.create(4.0);
    private final RateLimiter chemblRateLimiter = RateLimiter.create(4.0);

    // URLs de APIs
    private static final String PUBCHEM_BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    private static final String CHEMBL_BASE_URL = "https://www.ebi.ac.uk/chembl/api/data";

    @Override
    public List<ChemicalCompoundDTO> searchPubChem(String query, SearchType type) {
        pubchemRateLimiter.acquire(); // Rate limiting
        
        try {
            String url = buildPubChemUrl(query, type);
            if (url == null) {
                return new ArrayList<>();
            }

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                Map.class
            );

            return parsePubChemResponse(response.getBody(), query);
        } catch (Exception e) {
            System.err.println("Error buscando en PubChem: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<ChemicalCompoundDTO> searchChEMBL(String query, SearchType type) {
        chemblRateLimiter.acquire(); // Rate limiting
        
        try {
            String url = buildChEMBLUrl(query, type);
            if (url == null) {
                return new ArrayList<>();
            }

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                Map.class
            );

            return parseChEMBLResponse(response.getBody(), query);
        } catch (Exception e) {
            System.err.println("Error buscando en ChEMBL: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<ChemicalCompoundDTO> searchDrugBank(String query, SearchType type) {
        // DrugBank requiere registro y autenticación
        // Por ahora retornar lista vacía - implementar cuando se tenga acceso
        System.out.println("DrugBank search not yet implemented - requires authentication");
        return new ArrayList<>();
    }

    @Override
    public List<ChemicalCompoundDTO> searchZINC(String query, SearchType type) {
        // ZINC tiene API limitada - principalmente descargas
        // Por ahora retornar lista vacía
        System.out.println("ZINC search not yet implemented - limited API access");
        return new ArrayList<>();
    }

    @Override
    public Map<String, List<ChemicalCompoundDTO>> searchAll(String query, SearchType type) {
        Map<String, List<ChemicalCompoundDTO>> results = new HashMap<>();
        
        results.put("PubChem", searchPubChem(query, type));
        results.put("ChEMBL", searchChEMBL(query, type));
        // DrugBank y ZINC se pueden agregar cuando estén implementados
        
        return results;
    }

    @Override
    public ChemicalCompoundDTO getCompoundDetails(String source, String sourceId) {
        // Buscar primero en cache local
        Optional<ChemicalCompound> cached = compoundRepository.findBySourceAndSourceId(
            ChemicalCompound.ChemicalSource.valueOf(source), sourceId);
        
        if (cached.isPresent()) {
            return cached.get().getDTO();
        }

        // Si no está en cache, buscar en la API correspondiente
        // Por ahora, retornar null - se puede implementar después
        return null;
    }

    @Override
    @Cacheable("chemicalCompounds")
    public ChemicalCompoundDTO getCachedCompound(String inchiKey) {
        Optional<ChemicalCompound> compound = compoundRepository.findByInchiKey(inchiKey);
        return compound.map(ChemicalCompound::getDTO).orElse(null);
    }

    @Override
    public ChemicalCompoundDTO saveToCache(ChemicalCompoundDTO compoundDTO) {
        // Verificar si ya existe
        if (compoundDTO.getInchiKey() != null) {
            Optional<ChemicalCompound> existing = compoundRepository.findByInchiKey(compoundDTO.getInchiKey());
            if (existing.isPresent()) {
                return existing.get().getDTO();
            }
        }

        // Crear nuevo compuesto
        ChemicalCompound compound = new ChemicalCompound();
        compound.setName(compoundDTO.getName());
        compound.setFormula(compoundDTO.getFormula());
        compound.setMolecularWeight(compoundDTO.getMolecularWeight() != null ? 
            BigDecimal.valueOf(compoundDTO.getMolecularWeight()) : null);
        compound.setSmiles(compoundDTO.getSmiles());
        compound.setInchi(compoundDTO.getInchi());
        compound.setInchiKey(compoundDTO.getInchiKey());
        compound.setCasNumber(compoundDTO.getCasNumber());
        compound.setSource(ChemicalCompound.ChemicalSource.valueOf(compoundDTO.getSource()));
        compound.setSourceId(compoundDTO.getSourceId());
        compound.setLogP(compoundDTO.getLogP() != null ? BigDecimal.valueOf(compoundDTO.getLogP()) : null);
        compound.setLogS(compoundDTO.getLogS() != null ? BigDecimal.valueOf(compoundDTO.getLogS()) : null);
        compound.setHbd(compoundDTO.getHbd());
        compound.setHba(compoundDTO.getHba());
        compound.setRotatableBonds(compoundDTO.getRotatableBonds());
        compound.setTpsa(compoundDTO.getTpsa() != null ? BigDecimal.valueOf(compoundDTO.getTpsa()) : null);
        compound.setSolubility(compoundDTO.getSolubility());
        compound.setStability(compoundDTO.getStability());
        compound.setBioactivity(compoundDTO.getBioactivity());
        compound.setMechanismOfAction(compoundDTO.getMechanismOfAction());
        compound.setPurchasable(compoundDTO.getPurchasable());
        compound.setVendor(compoundDTO.getVendor());
        compound.setPrice(compoundDTO.getPrice() != null ? BigDecimal.valueOf(compoundDTO.getPrice()) : null);
        compound.setAdditionalProperties(compoundDTO.getAdditionalProperties());
        compound.setSourceUrl(compoundDTO.getSourceUrl());

        return compoundRepository.save(compound).getDTO();
    }

    // Métodos auxiliares privados

    private String buildPubChemUrl(String query, SearchType type) {
        query = query.trim().replace(" ", "%20");
        
        switch (type) {
            case NAME:
                return String.format("%s/compound/name/%s/property/MolecularWeight,CanonicalSMILES,XLogP,InChI,InChIKey/JSON",
                    PUBCHEM_BASE_URL, query);
            case FORMULA:
                return String.format("%s/compound/formula/%s/property/MolecularWeight,CanonicalSMILES,XLogP,InChI,InChIKey/JSON",
                    PUBCHEM_BASE_URL, query);
            case SMILES:
                return String.format("%s/compound/smiles/%s/property/MolecularWeight,CanonicalSMILES,XLogP,InChI,InChIKey/JSON",
                    PUBCHEM_BASE_URL, query);
            default:
                return null;
        }
    }

    private String buildChEMBLUrl(String query, SearchType type) {
        query = query.trim();
        
        switch (type) {
            case NAME:
                return String.format("%s/molecule.json?pref_name__icontains=%s&format=json",
                    CHEMBL_BASE_URL, query);
            default:
                return null;
        }
    }

    private List<ChemicalCompoundDTO> parsePubChemResponse(Map<String, Object> response, String query) {
        List<ChemicalCompoundDTO> compounds = new ArrayList<>();
        
        try {
            if (response == null || !response.containsKey("PropertyTable")) {
                return compounds;
            }

            Map<String, Object> propertyTable = (Map<String, Object>) response.get("PropertyTable");
            List<Map<String, Object>> properties = (List<Map<String, Object>>) propertyTable.get("Properties");

            if (properties == null || properties.isEmpty()) {
                return compounds;
            }

            for (Map<String, Object> prop : properties) {
                ChemicalCompoundDTO dto = new ChemicalCompoundDTO();
                dto.setSource("PubChem");
                
                // Intentar obtener el nombre real del compuesto, si está disponible
                // Por defecto usar el query
                String compoundName = query;
                if (prop.containsKey("Title")) {
                    compoundName = (String) prop.get("Title");
                } else if (prop.containsKey("IUPACName")) {
                    compoundName = (String) prop.get("IUPACName");
                }
                dto.setName(compoundName);
                
                // Extraer propiedades
                if (prop.containsKey("MolecularWeight")) {
                    Object mw = prop.get("MolecularWeight");
                    if (mw != null) {
                        if (mw instanceof Number) {
                            dto.setMolecularWeight(((Number) mw).doubleValue());
                        } else if (mw instanceof String) {
                            try {
                                dto.setMolecularWeight(Double.parseDouble((String) mw));
                            } catch (NumberFormatException e) {
                                // Ignorar si no se puede parsear
                            }
                        }
                    }
                }
                
                if (prop.containsKey("CanonicalSMILES")) {
                    Object smiles = prop.get("CanonicalSMILES");
                    if (smiles != null) {
                        dto.setSmiles(smiles.toString());
                    }
                }
                
                if (prop.containsKey("XLogP")) {
                    Object logP = prop.get("XLogP");
                    if (logP != null) {
                        if (logP instanceof Number) {
                            dto.setLogP(((Number) logP).doubleValue());
                        } else if (logP instanceof String) {
                            try {
                                dto.setLogP(Double.parseDouble((String) logP));
                            } catch (NumberFormatException e) {
                                // Ignorar si no se puede parsear
                            }
                        }
                    }
                }
                
                if (prop.containsKey("InChI")) {
                    Object inchi = prop.get("InChI");
                    if (inchi != null) {
                        dto.setInchi(inchi.toString());
                    }
                }
                
                if (prop.containsKey("InChIKey")) {
                    Object inchiKey = prop.get("InChIKey");
                    if (inchiKey != null) {
                        String key = inchiKey.toString();
                        dto.setInchiKey(key);
                        dto.setSourceId(key); // Usar InChIKey como sourceId
                    }
                }
                
                // Intentar obtener fórmula molecular si está disponible
                if (prop.containsKey("MolecularFormula")) {
                    Object formula = prop.get("MolecularFormula");
                    if (formula != null) {
                        dto.setFormula(formula.toString());
                    }
                }

                compounds.add(dto);
            }
        } catch (Exception e) {
            System.err.println("Error parseando respuesta de PubChem: " + e.getMessage());
            e.printStackTrace();
        }

        return compounds;
    }

    private List<ChemicalCompoundDTO> parseChEMBLResponse(Map<String, Object> response, String query) {
        List<ChemicalCompoundDTO> compounds = new ArrayList<>();
        
        try {
            if (response == null || !response.containsKey("molecules")) {
                return compounds;
            }

            List<Map<String, Object>> molecules = (List<Map<String, Object>>) response.get("molecules");

            if (molecules == null) {
                return compounds;
            }

            for (Map<String, Object> molecule : molecules) {
                ChemicalCompoundDTO dto = new ChemicalCompoundDTO();
                dto.setSource("ChEMBL");
                
                // Nombre
                if (molecule.containsKey("pref_name")) {
                    Object prefName = molecule.get("pref_name");
                    if (prefName != null) {
                        dto.setName(prefName.toString());
                    }
                } else if (molecule.containsKey("molecule_synonyms")) {
                    // Intentar obtener nombre de sinónimos
                    List<Map<String, Object>> synonyms = (List<Map<String, Object>>) molecule.get("molecule_synonyms");
                    if (synonyms != null && !synonyms.isEmpty() && synonyms.get(0).containsKey("synonym")) {
                        dto.setName(synonyms.get(0).get("synonym").toString());
                    } else {
                        dto.setName(query);
                    }
                } else {
                    dto.setName(query);
                }
                
                // Source ID
                if (molecule.containsKey("molecule_chembl_id")) {
                    dto.setSourceId((String) molecule.get("molecule_chembl_id"));
                }
                
                // Estructuras moleculares
                if (molecule.containsKey("molecule_structures")) {
                    Map<String, Object> structures = (Map<String, Object>) molecule.get("molecule_structures");
                    if (structures != null) {
                        if (structures.containsKey("canonical_smiles")) {
                            dto.setSmiles((String) structures.get("canonical_smiles"));
                        }
                        if (structures.containsKey("standard_inchi")) {
                            dto.setInchi((String) structures.get("standard_inchi"));
                        }
                        if (structures.containsKey("standard_inchi_key")) {
                            dto.setInchiKey((String) structures.get("standard_inchi_key"));
                        }
                    }
                }
                
                // Propiedades moleculares
                if (molecule.containsKey("molecule_properties")) {
                    Map<String, Object> properties = (Map<String, Object>) molecule.get("molecule_properties");
                    if (properties != null) {
                        if (properties.containsKey("molecular_weight")) {
                            Object mw = properties.get("molecular_weight");
                            if (mw instanceof Number) {
                                dto.setMolecularWeight(((Number) mw).doubleValue());
                            }
                        }
                        if (properties.containsKey("alogp")) {
                            Object logP = properties.get("alogp");
                            if (logP instanceof Number) {
                                dto.setLogP(((Number) logP).doubleValue());
                            }
                        }
                        if (properties.containsKey("hbd")) {
                            Object hbd = properties.get("hbd");
                            if (hbd instanceof Number) {
                                dto.setHbd(((Number) hbd).intValue());
                            }
                        }
                        if (properties.containsKey("hba")) {
                            Object hba = properties.get("hba");
                            if (hba instanceof Number) {
                                dto.setHba(((Number) hba).intValue());
                            }
                        }
                        if (properties.containsKey("rotatable_bonds")) {
                            Object rotBonds = properties.get("rotatable_bonds");
                            if (rotBonds instanceof Number) {
                                dto.setRotatableBonds(((Number) rotBonds).intValue());
                            }
                        }
                        if (properties.containsKey("psa")) {
                            Object tpsa = properties.get("psa");
                            if (tpsa instanceof Number) {
                                dto.setTpsa(((Number) tpsa).doubleValue());
                            }
                        }
                    }
                }
                
                // Fórmula molecular
                if (molecule.containsKey("molecule_properties")) {
                    Map<String, Object> properties = (Map<String, Object>) molecule.get("molecule_properties");
                    if (properties != null && properties.containsKey("full_molformula")) {
                        dto.setFormula((String) properties.get("full_molformula"));
                    }
                }

                compounds.add(dto);
            }
        } catch (Exception e) {
            System.err.println("Error parseando respuesta de ChEMBL: " + e.getMessage());
            e.printStackTrace();
        }

        return compounds;
    }
}

