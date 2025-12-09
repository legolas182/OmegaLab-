package com.plm.plm.services.serviceImplements;

import com.google.common.util.concurrent.RateLimiter;
import com.plm.plm.dto.ChemicalCompoundDTO;
import com.plm.plm.services.ChemicalDatabaseService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChemicalDatabaseServiceImpl implements ChemicalDatabaseService {

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
    public Map<String, List<ChemicalCompoundDTO>> searchAll(String query, SearchType type) {
        Map<String, List<ChemicalCompoundDTO>> results = new HashMap<>();
        
        results.put("PubChem", searchPubChem(query, type));
        results.put("ChEMBL", searchChEMBL(query, type));
        
        return results;
    }

    // Métodos auxiliares privados

    private String buildPubChemUrl(String query, SearchType type) {
        query = query.trim().replace(" ", "%20");
        
        // Propiedades adicionales disponibles en PubChem:
        // MolecularFormula, Title, IUPACName, IsomericSMILES, etc.
        String properties = "MolecularWeight,CanonicalSMILES,IsomericSMILES,MolecularFormula,XLogP,InChI,InChIKey,Title,IUPACName";
        
        switch (type) {
            case NAME:
                return String.format("%s/compound/name/%s/property/%s/JSON",
                    PUBCHEM_BASE_URL, query, properties);
            case FORMULA:
                return String.format("%s/compound/formula/%s/property/%s/JSON",
                    PUBCHEM_BASE_URL, query, properties);
            case SMILES:
                return String.format("%s/compound/smiles/%s/property/%s/JSON",
                    PUBCHEM_BASE_URL, query, properties);
            default:
                return null;
        }
    }

    private String buildChEMBLUrl(String query, SearchType type) {
        query = query.trim();
        
        switch (type) {
            case NAME:
                // Incluir más campos en la respuesta usando el parámetro 'fields'
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
                
                // Debug: Log todas las claves disponibles
                System.out.println("PubChem properties keys: " + prop.keySet());
                
                // Intentar obtener el nombre real del compuesto, si está disponible
                // Prioridad: Title (nombre común) > IUPACName (nombre técnico) > query
                String compoundName = query;
                if (prop.containsKey("Title")) {
                    Object title = prop.get("Title");
                    if (title != null && !title.toString().trim().isEmpty()) {
                        compoundName = title.toString();
                    }
                } else if (prop.containsKey("IUPACName")) {
                    Object iupac = prop.get("IUPACName");
                    if (iupac != null && !iupac.toString().trim().isEmpty()) {
                        compoundName = iupac.toString();
                    }
                }
                dto.setName(compoundName);
                
                // Extraer propiedades - intentar múltiples nombres posibles
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
                
                // Intentar múltiples variantes de SMILES
                if (prop.containsKey("CanonicalSMILES")) {
                    Object smiles = prop.get("CanonicalSMILES");
                    if (smiles != null && !smiles.toString().trim().isEmpty()) {
                        dto.setSmiles(smiles.toString());
                    }
                } else if (prop.containsKey("IsomericSMILES")) {
                    Object smiles = prop.get("IsomericSMILES");
                    if (smiles != null && !smiles.toString().trim().isEmpty()) {
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
                
                // Intentar obtener fórmula molecular - múltiples variantes
                if (prop.containsKey("MolecularFormula")) {
                    Object formula = prop.get("MolecularFormula");
                    if (formula != null && !formula.toString().trim().isEmpty()) {
                        dto.setFormula(formula.toString());
                    }
                } else if (prop.containsKey("Formula")) {
                    Object formula = prop.get("Formula");
                    if (formula != null && !formula.toString().trim().isEmpty()) {
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
                
                // Debug: Log todas las claves disponibles
                System.out.println("ChEMBL molecule keys: " + molecule.keySet());
                
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
                        System.out.println("ChEMBL structures keys: " + structures.keySet());
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
                        System.out.println("ChEMBL properties keys: " + properties.keySet());
                        if (properties.containsKey("molecular_weight")) {
                            Object mw = properties.get("molecular_weight");
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
                        if (properties.containsKey("alogp")) {
                            Object logP = properties.get("alogp");
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
                            if (tpsa != null) {
                                if (tpsa instanceof Number) {
                                    dto.setTpsa(((Number) tpsa).doubleValue());
                                } else if (tpsa instanceof String) {
                                    try {
                                        dto.setTpsa(Double.parseDouble((String) tpsa));
                                    } catch (NumberFormatException e) {
                                        // Ignorar si no se puede parsear
                                    }
                                }
                            }
                        }
                        // Fórmula molecular
                        if (properties.containsKey("full_molformula")) {
                            Object formula = properties.get("full_molformula");
                            if (formula != null && !formula.toString().trim().isEmpty()) {
                                dto.setFormula(formula.toString());
                            }
                        }
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

