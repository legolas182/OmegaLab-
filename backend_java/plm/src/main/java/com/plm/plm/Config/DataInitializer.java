package com.plm.plm.Config;

import com.plm.plm.Enums.EstadoBOM;
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Enums.Rol;
import com.plm.plm.Enums.TipoProducto;
import com.plm.plm.Models.BOM;
import com.plm.plm.Models.BOMItem;
import com.plm.plm.Models.Category;
import com.plm.plm.Models.Material;
import com.plm.plm.Models.Product;
import com.plm.plm.Models.User;
import com.plm.plm.Reposotory.BOMItemRepository;
import com.plm.plm.Reposotory.BOMRepository;
import com.plm.plm.Reposotory.CategoryRepository;
import com.plm.plm.Reposotory.MaterialRepository;
import com.plm.plm.Reposotory.ProductRepository;
import com.plm.plm.Reposotory.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BOMRepository bomRepository;

    @Autowired
    private BOMItemRepository bomItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        updateIdeasTableSchema();
        updatePruebasTableSchema();
        initializeUsers();
        initializeCategories();
        initializeMaterials();
        initializeProducts();
        initializeBOMs();
    }

    /**
     * Actualiza la estructura de la tabla ideas si es necesario
     */
    private void updateIdeasTableSchema() {
        try {
            System.out.println("Verificando y actualizando estructura de la tabla ideas...");
            
            // Verificar si la tabla existe
            String checkTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ideas'";
            Integer tableExists = jdbcTemplate.queryForObject(checkTable, Integer.class);
            
            if (tableExists == null || tableExists == 0) {
                System.out.println("La tabla ideas no existe. Se creará automáticamente por JPA.");
                return;
            }

            // Verificar si la columna objetivo existe
            String checkObjetivo = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ideas' AND column_name = 'objetivo'";
            Integer objetivoExists = jdbcTemplate.queryForObject(checkObjetivo, Integer.class);
            
            if (objetivoExists == null || objetivoExists == 0) {
                System.out.println("Agregando columna 'objetivo' a la tabla ideas...");
                jdbcTemplate.execute("ALTER TABLE ideas ADD COLUMN objetivo TEXT AFTER prioridad");
                System.out.println("Columna 'objetivo' agregada exitosamente");
            }

            // Verificar si la columna producto_origen_id existe
            String checkProductoOrigen = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ideas' AND column_name = 'producto_origen_id'";
            Integer productoOrigenExists = jdbcTemplate.queryForObject(checkProductoOrigen, Integer.class);
            
            if (productoOrigenExists == null || productoOrigenExists == 0) {
                System.out.println("Agregando columna 'producto_origen_id' a la tabla ideas...");
                jdbcTemplate.execute("ALTER TABLE ideas ADD COLUMN producto_origen_id INT AFTER objetivo");
                System.out.println("Columna 'producto_origen_id' agregada exitosamente");
            }

            // Verificar si la columna asignado_a existe
            String checkAsignadoA = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ideas' AND column_name = 'asignado_a'";
            Integer asignadoAExists = jdbcTemplate.queryForObject(checkAsignadoA, Integer.class);
            
            if (asignadoAExists == null || asignadoAExists == 0) {
                System.out.println("Agregando columna 'asignado_a' a la tabla ideas...");
                jdbcTemplate.execute("ALTER TABLE ideas ADD COLUMN asignado_a INT AFTER producto_origen_id");
                System.out.println("Columna 'asignado_a' agregada exitosamente");
            }

            // Verificar si la columna detalles_ia existe
            String checkDetallesIA = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ideas' AND column_name = 'detalles_ia'";
            Integer detallesIAExists = jdbcTemplate.queryForObject(checkDetallesIA, Integer.class);
            
            if (detallesIAExists == null || detallesIAExists == 0) {
                System.out.println("Agregando columna 'detalles_ia' a la tabla ideas...");
                jdbcTemplate.execute("ALTER TABLE ideas ADD COLUMN detalles_ia LONGTEXT AFTER descripcion");
                System.out.println("Columna 'detalles_ia' agregada exitosamente");
            }

            // Verificar si la columna pruebas_requeridas existe
            String checkPruebasRequeridas = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ideas' AND column_name = 'pruebas_requeridas'";
            Integer pruebasRequeridasExists = jdbcTemplate.queryForObject(checkPruebasRequeridas, Integer.class);
            
            if (pruebasRequeridasExists == null || pruebasRequeridasExists == 0) {
                System.out.println("Agregando columna 'pruebas_requeridas' a la tabla ideas...");
                jdbcTemplate.execute("ALTER TABLE ideas ADD COLUMN pruebas_requeridas TEXT AFTER detalles_ia");
                System.out.println("Columna 'pruebas_requeridas' agregada exitosamente");
            }

            // Verificar y actualizar el ENUM de estado
            try {
                String checkEstado = "SELECT COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'ideas' AND column_name = 'estado'";
                String estadoType = jdbcTemplate.queryForObject(checkEstado, String.class);
                
                if (estadoType != null) {
                    System.out.println("Actualizando ENUM de estado en la tabla ideas...");
                    // Cambiar el tipo de columna a VARCHAR para permitir valores mayúsculas
                    jdbcTemplate.execute("ALTER TABLE ideas MODIFY COLUMN estado VARCHAR(20) DEFAULT 'GENERADA'");
                    System.out.println("Columna estado cambiada a VARCHAR exitosamente");
                    
                    // Actualizar valores en minúsculas a mayúsculas para coincidir con el enum
                    jdbcTemplate.update("UPDATE ideas SET estado = 'GENERADA' WHERE LOWER(estado) = 'generada' OR estado = 'borrador'");
                    jdbcTemplate.update("UPDATE ideas SET estado = 'EN_REVISION' WHERE LOWER(estado) = 'en_revision'");
                    jdbcTemplate.update("UPDATE ideas SET estado = 'APROBADA' WHERE LOWER(estado) = 'aprobada'");
                    jdbcTemplate.update("UPDATE ideas SET estado = 'EN_PRUEBA' WHERE LOWER(estado) = 'en_prueba'");
                    jdbcTemplate.update("UPDATE ideas SET estado = 'PRUEBA_APROBADA' WHERE LOWER(estado) = 'prueba_aprobada'");
                    jdbcTemplate.update("UPDATE ideas SET estado = 'RECHAZADA' WHERE LOWER(estado) = 'rechazada'");
                    jdbcTemplate.update("UPDATE ideas SET estado = 'EN_PRODUCCION' WHERE LOWER(estado) = 'en_produccion' OR estado = 'convertida'");
                    System.out.println("Valores de estado actualizados a mayúsculas exitosamente");
                }
            } catch (Exception e) {
                System.out.println("Advertencia: No se pudo actualizar el ENUM de estado: " + e.getMessage());
                e.printStackTrace();
            }

            // Verificar y agregar índices
            try {
                String checkIndex1 = "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'ideas' AND index_name = 'idx_producto_origen_id'";
                Integer index1Exists = jdbcTemplate.queryForObject(checkIndex1, Integer.class);
                if (index1Exists == null || index1Exists == 0) {
                    System.out.println("Agregando índice 'idx_producto_origen_id'...");
                    jdbcTemplate.execute("CREATE INDEX idx_producto_origen_id ON ideas(producto_origen_id)");
                }

                String checkIndex2 = "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'ideas' AND index_name = 'idx_asignado_a'";
                Integer index2Exists = jdbcTemplate.queryForObject(checkIndex2, Integer.class);
                if (index2Exists == null || index2Exists == 0) {
                    System.out.println("Agregando índice 'idx_asignado_a'...");
                    jdbcTemplate.execute("CREATE INDEX idx_asignado_a ON ideas(asignado_a)");
                }
            } catch (Exception e) {
                System.out.println("Advertencia: No se pudieron crear índices: " + e.getMessage());
            }

            // Verificar y agregar foreign keys
            try {
                String checkFK1 = "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND constraint_name = 'fk_idea_producto_origen' AND table_name = 'ideas'";
                Integer fk1Exists = jdbcTemplate.queryForObject(checkFK1, Integer.class);
                if (fk1Exists == null || fk1Exists == 0) {
                    System.out.println("Agregando foreign key 'fk_idea_producto_origen'...");
                    jdbcTemplate.execute("ALTER TABLE ideas ADD CONSTRAINT fk_idea_producto_origen FOREIGN KEY (producto_origen_id) REFERENCES productos(id) ON DELETE SET NULL");
                }

                String checkFK2 = "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND constraint_name = 'fk_idea_asignado' AND table_name = 'ideas'";
                Integer fk2Exists = jdbcTemplate.queryForObject(checkFK2, Integer.class);
                if (fk2Exists == null || fk2Exists == 0) {
                    System.out.println("Agregando foreign key 'fk_idea_asignado'...");
                    jdbcTemplate.execute("ALTER TABLE ideas ADD CONSTRAINT fk_idea_asignado FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL");
                }
            } catch (Exception e) {
                System.out.println("Advertencia: No se pudieron crear foreign keys (puede que ya existan): " + e.getMessage());
            }

            System.out.println("Estructura de la tabla ideas verificada y actualizada correctamente.\n");
        } catch (Exception e) {
            System.err.println("Error al actualizar la estructura de la tabla ideas: " + e.getMessage());
            e.printStackTrace();
            // No lanzar excepción para que la aplicación pueda continuar
        }
    }

    /**
     * Actualiza la estructura de las tablas de pruebas si es necesario
     */
    private void updatePruebasTableSchema() {
        try {
            System.out.println("Verificando y actualizando estructura de las tablas de pruebas...");
            
            // Verificar si la tabla pruebas existe
            String checkTable = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'pruebas'";
            Integer tableExists = jdbcTemplate.queryForObject(checkTable, Integer.class);
            
            if (tableExists == null || tableExists == 0) {
                System.out.println("Las tablas de pruebas no existen. Se crearán automáticamente por JPA.");
                return;
            }
            
            // Agregar columna pruebas_requeridas si no existe
            String checkColumn = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'pruebas' AND column_name = 'pruebas_requeridas'";
            Integer columnExists = jdbcTemplate.queryForObject(checkColumn, Integer.class);
            
            if (columnExists == null || columnExists == 0) {
                System.out.println("Agregando columna pruebas_requeridas a la tabla pruebas...");
                jdbcTemplate.execute("ALTER TABLE pruebas ADD COLUMN pruebas_requeridas TEXT AFTER equipos_utilizados");
                System.out.println("Columna pruebas_requeridas agregada exitosamente.");
            }
            
            System.out.println("Las tablas de pruebas ya existen. No se requiere actualización.");
        } catch (Exception e) {
            System.out.println("Error al verificar tablas de pruebas: " + e.getMessage());
            // No lanzar excepción, permitir que JPA cree las tablas si es necesario
        }
    }

    private void initializeUsers() {
        // Configuración de usuarios para cada rol
        Object[][] usuariosConfig = {
            {Rol.ADMINISTRADOR, "admin@omegalab.com", "admin123", "Administrador"},
            {Rol.SUPERVISOR_QA, "supervisor.qa@omegalab.com", "supervisor123", "Supervisor QA"},
            {Rol.SUPERVISOR_CALIDAD, "supervisor.calidad@omegalab.com", "calidad123", "Supervisor Calidad"},
            {Rol.ANALISTA_LABORATORIO, "analista.lab@omegalab.com", "analista123", "Analista Laboratorio"}
        };

        List<User> usuariosCreados = new ArrayList<>();

        for (Object[] config : usuariosConfig) {
            Rol rol = (Rol) config[0];
            String email = (String) config[1];
            String password = (String) config[2];
            String nombre = (String) config[3];

            if (userRepository.findByEmail(email).isPresent()) {
                System.out.println("El usuario " + email + " ya existe");
                continue;
            }

            String hashedPassword = passwordEncoder.encode(password);

            User usuario = new User();
            usuario.setEmail(email);
            usuario.setPassword(hashedPassword);
            usuario.setNombre(nombre);
            usuario.setRol(rol);
            usuario.setEstado(EstadoUsuario.ACTIVO);

            userRepository.save(usuario);
            usuariosCreados.add(usuario);

            System.out.println("Usuario " + rol.name() + " creado exitosamente");
            System.out.println("  Email: " + email);
            System.out.println("  Password: " + password);
        }

        if (!usuariosCreados.isEmpty()) {
            System.out.println("\nTotal de usuarios creados: " + usuariosCreados.size());
            System.out.println("IMPORTANTE: Cambia las contraseñas después del primer login");
        }
    }

    private void initializeCategories() {
        // No borrar datos existentes para preservar las ideas y sus relaciones
        long existingCategories = categoryRepository.count();
        if (existingCategories > 0) {
            System.out.println("Se encontraron " + existingCategories + " categorías existentes. Se preservarán.");
        }

        long existingMaterials = materialRepository.count();
        if (existingMaterials > 0) {
            System.out.println("Se encontraron " + existingMaterials + " materiales existentes. Se preservarán.");
        }

        long existingProducts = productRepository.count();
        if (existingProducts > 0) {
            System.out.println("Se encontraron " + existingProducts + " productos existentes. Se preservarán.");
        }

        // Obtener categorías existentes para verificar cuáles faltan
        List<Category> existingCategoriesList = categoryRepository.findAll();
        java.util.Map<String, Category> existingCategoriesMap = new java.util.HashMap<>();
        for (Category cat : existingCategoriesList) {
            existingCategoriesMap.put(cat.getNombre() + "_" + cat.getTipoProducto().name(), cat);
        }

        List<Category> categoriesToCreate = new ArrayList<>();

        String[][] categoriasPT = {
            {"Proteínas", "Proteínas de suero y mezclas proteicas"},
            {"Proteínas Veganas", "Proteínas de origen vegetal"},
            {"Proteínas Premium", "Proteínas de alta calidad y pureza"},
            {"Creatinas", "Suplementos de creatina estándar"},
            {"Creatinas Premium", "Creatinas de máxima pureza"},
            {"Aminoácidos", "Suplementos de aminoácidos esenciales y BCAA"},
            {"Pre-entrenamiento", "Suplementos pre-entrenamiento con estimulantes"},
            {"Multivitamínicos", "Complejos multivitamínicos"},
            {"Omega 3", "Ácidos grasos Omega 3"},
            {"Kits", "Kits y combos de productos"}
        };

        String[][] categoriasMP = {
            {"Proteínas MP", "Materias primas proteicas"},
            {"Proteínas Vegetales MP", "Proteínas de origen vegetal"},
            {"Creatinas MP", "Materias primas de creatina"},
            {"Aminoácidos MP", "Aminoácidos en polvo"},
            {"Estimulantes", "Estimulantes y energizantes"},
            {"Vasodilatadores", "Vasodilatadores para bombeo"},
            {"Carbohidratos", "Carbohidratos de rápida absorción"}
        };

        String[][] categoriasComp = {
            {"Edulcorantes", "Edulcorantes artificiales y naturales"},
            {"Saborizantes", "Saborizantes artificiales"},
            {"Colorantes", "Colorantes naturales y artificiales"},
            {"Emulsionantes", "Emulsionantes y estabilizantes"},
            {"Espesantes", "Espesantes y texturizantes"},
            {"Acidulantes", "Acidulantes para regulación de pH"},
            {"Vitaminas", "Vitaminas en polvo"},
            {"Enzimas", "Enzimas digestivas"}
        };

        // Crear solo categorías que no existen
        for (String[] cat : categoriasPT) {
            String key = cat[0] + "_" + TipoProducto.PRODUCTO_TERMINADO.name();
            if (!existingCategoriesMap.containsKey(key)) {
                Category category = new Category();
                category.setNombre(cat[0]);
                category.setDescripcion(cat[1]);
                category.setTipoProducto(TipoProducto.PRODUCTO_TERMINADO);
                category.setEstado(EstadoUsuario.ACTIVO);
                categoriesToCreate.add(category);
            }
        }

        for (String[] cat : categoriasMP) {
            String key = cat[0] + "_" + TipoProducto.MATERIA_PRIMA.name();
            if (!existingCategoriesMap.containsKey(key)) {
                Category category = new Category();
                category.setNombre(cat[0]);
                category.setDescripcion(cat[1]);
                category.setTipoProducto(TipoProducto.MATERIA_PRIMA);
                category.setEstado(EstadoUsuario.ACTIVO);
                categoriesToCreate.add(category);
            }
        }

        for (String[] cat : categoriasComp) {
            String key = cat[0] + "_" + TipoProducto.COMPONENTE.name();
            if (!existingCategoriesMap.containsKey(key)) {
                Category category = new Category();
                category.setNombre(cat[0]);
                category.setDescripcion(cat[1]);
                category.setTipoProducto(TipoProducto.COMPONENTE);
                category.setEstado(EstadoUsuario.ACTIVO);
                categoriesToCreate.add(category);
            }
        }

        if (!categoriesToCreate.isEmpty()) {
            categoryRepository.saveAll(categoriesToCreate);
            System.out.println("Se crearon " + categoriesToCreate.size() + " nuevas categorías exitosamente");
        } else {
            System.out.println("Todas las categorías ya existen. No se crearon nuevas.");
        }
    }

    private void initializeProducts() {
        // Verificar productos existentes por código
        List<Product> existingProducts = productRepository.findAll();
        java.util.Map<String, Product> existingProductsMap = new java.util.HashMap<>();
        for (Product p : existingProducts) {
            existingProductsMap.put(p.getCodigo(), p);
        }

        List<Product> productsToCreate = new ArrayList<>();

        String[] productosTerminados = {
            "BEST WHEY 2.04 LB", "BEST WHEY 4 LB", "BEST PROTEIN 2.04 LB",
            "BEST VEGAN", "SMART 3.25 LB", "SMART 6 LB", "SMART BOLSA 13.01 LB",
            "LA WEY 1.72 LB", "LEGACY 30S CREATINA HCL", "LEGACY 50S CREATINA HCL",
            "LEGACY PLUS 50S", "LEGEND CON CREAPURE®", "LEGEND CON CREAPURE® 50s",
            "EEA'S (ARMY) 30 SERVICIOS", "INTENZE 30 SERVICIOS", "THE ONE",
            "OMEGA 3", "KIT GYMBRO", "KIT GYM RAT", "KIT ESSENTIAL"
        };

        String[] descripcionesPT = {
            "Proteína de suero de leche concentrada, 2.04 libras. Alta calidad y pureza.",
            "Proteína de suero de leche concentrada, 4 libras. Formato económico.",
            "Mezcla premium de proteínas de múltiples fuentes, 2.04 libras.",
            "Proteína vegana a base de plantas. Sin ingredientes de origen animal.",
            "Proteína inteligente con fórmula avanzada, 3.25 libras.",
            "Proteína inteligente con fórmula avanzada, 6 libras. Formato familiar.",
            "Proteína inteligente en presentación económica, 13.01 libras.",
            "Proteína de suero de leche premium, 1.72 libras.",
            "Creatina HCL en cápsulas, 30 servicios. Alta absorción.",
            "Creatina HCL en cápsulas, 50 servicios. Formato económico.",
            "Creatina HCL plus con ingredientes adicionales, 50 servicios.",
            "Creatina monohidrato con Creapure®, máxima pureza y calidad.",
            "Creatina monohidrato con Creapure®, 50 servicios. Formato extendido.",
            "Aminoácidos esenciales (EEA's) en presentación Army, 30 servicios.",
            "Pre-entrenamiento intenso, 30 servicios. Energía y rendimiento.",
            "Suplemento multivitamínico completo. Todo en uno.",
            "Ácidos grasos Omega 3. Apoyo cardiovascular y cognitivo.",
            "Kit básico para principiantes en el gimnasio.",
            "Kit intermedio para atletas regulares.",
            "Kit esencial con productos fundamentales."
        };

        String[] categoriasPT = {
            "Proteínas", "Proteínas", "Proteínas", "Proteínas Veganas",
            "Proteínas", "Proteínas", "Proteínas", "Proteínas Premium",
            "Creatinas", "Creatinas", "Creatinas", "Creatinas Premium",
            "Creatinas Premium", "Aminoácidos", "Pre-entrenamiento",
            "Multivitamínicos", "Omega 3", "Kits", "Kits", "Kits"
        };

        java.util.Map<String, Category> categoriasMap = new java.util.HashMap<>();
        List<Category> allCategories = categoryRepository.findAll();
        for (Category cat : allCategories) {
            categoriasMap.put(cat.getNombre(), cat);
        }

        for (int i = 0; i < 20; i++) {
            String codigo = "PT-" + String.format("%03d", i + 1);
            // Solo crear si no existe
            if (!existingProductsMap.containsKey(codigo)) {
                Product product = new Product();
                product.setCodigo(codigo);
                product.setNombre(productosTerminados[i]);
                product.setDescripcion(descripcionesPT[i]);
                Category categoriaEntity = categoriasMap.get(categoriasPT[i]);
                if (categoriaEntity != null) {
                    product.setCategoriaEntity(categoriaEntity);
                }
                product.setUnidadMedida("un");
                product.setEstado(EstadoUsuario.ACTIVO);
                productsToCreate.add(product);
            }
        }

        if (!productsToCreate.isEmpty()) {
            productRepository.saveAll(productsToCreate);
            System.out.println("Se crearon " + productsToCreate.size() + " nuevos productos terminados exitosamente");
        } else {
            System.out.println("Todos los productos ya existen. No se crearon nuevos.");
        }
    }

    private void initializeMaterials() {
        // Verificar materiales existentes por código
        List<Material> existingMaterials = materialRepository.findAll();
        java.util.Map<String, Material> existingMaterialsMap = new java.util.HashMap<>();
        for (Material m : existingMaterials) {
            existingMaterialsMap.put(m.getCodigo(), m);
        }

        List<Material> materialsToCreate = new ArrayList<>();

        String[] materiasPrimas = {
            "Proteína de Suero Concentrada (WPC 80%)", "Proteína de Suero Aislada (WPI 90%)",
            "Caseína Micelar", "Proteína de Guisante", "Proteína de Arroz",
            "Creatina Monohidrato", "Creatina HCL", "BCAA (2:1:1)",
            "Aminoácidos Esenciales (EEA)", "L-Glutamina", "Beta Alanina",
            "Cafeína Anhidra", "Citrulina Malato", "Taurina", "Dextrosa"
        };

        String[] descripcionesMP = {
            "Proteína de suero concentrada al 80%. Materia prima base para proteínas.",
            "Proteína de suero aislada al 90%. Alta pureza y biodisponibilidad.",
            "Caseína micelar de lenta absorción. Ideal para productos nocturnos.",
            "Proteína vegetal de guisante. Base para productos veganos.",
            "Proteína vegetal de arroz. Complemento para mezclas veganas.",
            "Creatina monohidrato pura. Estándar de la industria.",
            "Creatina hidrocloruro. Mayor solubilidad y absorción.",
            "Aminoácidos de cadena ramificada en proporción 2:1:1.",
            "Mezcla de aminoácidos esenciales. Recuperación muscular.",
            "L-Glutamina en polvo. Recuperación y sistema inmune.",
            "Beta Alanina en polvo. Resistencia y rendimiento.",
            "Cafeína anhidra pura. Estimulante para pre-entrenamiento.",
            "Citrulina malato. Vasodilatación y bombeo muscular.",
            "Taurina en polvo. Apoyo energético y cardiovascular.",
            "Dextrosa pura. Carbohidrato de rápida absorción."
        };

        String[] categoriasMP = {
            "Proteínas MP", "Proteínas MP", "Proteínas MP", "Proteínas Vegetales MP",
            "Proteínas Vegetales MP", "Creatinas MP", "Creatinas MP", "Aminoácidos MP",
            "Aminoácidos MP", "Aminoácidos MP", "Aminoácidos MP", "Estimulantes",
            "Vasodilatadores", "Aminoácidos MP", "Carbohidratos"
        };

        java.util.Map<String, Category> categoriasMap = new java.util.HashMap<>();
        List<Category> allCategories = categoryRepository.findAll();
        for (Category cat : allCategories) {
            categoriasMap.put(cat.getNombre(), cat);
        }

        for (int i = 0; i < 15; i++) {
            String codigo = "MP-" + String.format("%03d", i + 1);
            // Solo crear si no existe
            if (!existingMaterialsMap.containsKey(codigo)) {
                Material material = new Material();
                material.setCodigo(codigo);
                material.setNombre(materiasPrimas[i]);
                material.setDescripcion(descripcionesMP[i]);
                Category categoriaEntity = categoriasMap.get(categoriasMP[i]);
                if (categoriaEntity != null) {
                    material.setCategoriaEntity(categoriaEntity);
                }
                material.setUnidadMedida("kg");
                material.setEstado(EstadoUsuario.ACTIVO);
                materialsToCreate.add(material);
            }
        }

        if (!materialsToCreate.isEmpty()) {
            materialRepository.saveAll(materialsToCreate);
            System.out.println("Se crearon " + materialsToCreate.size() + " nuevos materiales exitosamente");
        } else {
            System.out.println("Todos los materiales ya existen. No se crearon nuevos.");
        }
    }

    private void initializeBOMs() {
        // Verificar BOMs existentes para no duplicar
        List<BOM> existingBOMs = bomRepository.findAll();
        java.util.Map<Integer, BOM> existingBOMsMap = new java.util.HashMap<>();
        for (BOM bom : existingBOMs) {
            if (bom.getProducto() != null) {
                existingBOMsMap.put(bom.getProducto().getId(), bom);
            }
        }
        
        if (existingBOMs.size() > 0) {
            System.out.println("Se encontraron " + existingBOMs.size() + " BOMs existentes. Se preservarán.");
        }

        // Obtener el usuario admin para asignar como creador
        Optional<User> adminOpt = userRepository.findByEmail("admin@omegalab.com");
        User admin = adminOpt.orElse(null);

        List<Product> allProducts = productRepository.findAll();
        java.util.Map<String, Product> productosMap = new java.util.HashMap<>();
        for (Product p : allProducts) {
            productosMap.put(p.getCodigo(), p);
        }

        List<Material> allMaterials = materialRepository.findAll();
        java.util.Map<String, Material> materialesMap = new java.util.HashMap<>();
        for (Material m : allMaterials) {
            materialesMap.put(m.getCodigo(), m);
        }

        // Crear BOMs solo para productos que no tienen BOM
        // Crear BOMs para productos terminados de proteínas
        if (!existingBOMsMap.containsKey(productosMap.get("PT-001") != null ? productosMap.get("PT-001").getId() : -1)) {
            createBOMForProduct(productosMap.get("PT-001"), "BEST WHEY 2.04 LB", admin, productosMap,
            new String[]{"MP-001", "MP-001", "MP-001", "MP-001", "MP-001"},
            new double[]{0.85, 0.05, 0.03, 0.04, 0.03},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        if (!existingBOMsMap.containsKey(productosMap.get("PT-002") != null ? productosMap.get("PT-002").getId() : -1)) {
            createBOMForProduct(productosMap.get("PT-002"), "BEST WHEY 4 LB", admin, productosMap,
            new String[]{"MP-001", "MP-002", "MP-003", "MP-004", "MP-005"},
            new double[]{0.85, 0.05, 0.03, 0.04, 0.03},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        // Crear BOMs solo si no existen
        if (productosMap.get("PT-003") != null && !existingBOMsMap.containsKey(productosMap.get("PT-003").getId())) {
            createBOMForProduct(productosMap.get("PT-003"), "BEST PROTEIN 2.04 LB", admin, productosMap,
            new String[]{"MP-001", "MP-002", "MP-003", "MP-004", "MP-005", "MP-006"},
            new double[]{0.50, 0.30, 0.15, 0.03, 0.01, 0.01},
            new String[]{"kg", "kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-004") != null && !existingBOMsMap.containsKey(productosMap.get("PT-004").getId())) {
            createBOMForProduct(productosMap.get("PT-004"), "BEST VEGAN", admin, productosMap,
            new String[]{"MP-004", "MP-005", "MP-006", "MP-007", "MP-008", "MP-009"},
            new double[]{0.60, 0.30, 0.02, 0.04, 0.02, 0.02},
            new String[]{"kg", "kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-005") != null && !existingBOMsMap.containsKey(productosMap.get("PT-005").getId())) {
            createBOMForProduct(productosMap.get("PT-005"), "SMART 3.25 LB", admin, productosMap,
            new String[]{"MP-001", "MP-002", "MP-003", "MP-004", "MP-005", "MP-006"},
            new double[]{0.70, 0.20, 0.05, 0.02, 0.02, 0.01},
            new String[]{"kg", "kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-006") != null && !existingBOMsMap.containsKey(productosMap.get("PT-006").getId())) {
            createBOMForProduct(productosMap.get("PT-006"), "SMART 6 LB", admin, productosMap,
            new String[]{"MP-001", "MP-002", "MP-003", "MP-004", "MP-005", "MP-006"},
            new double[]{0.70, 0.20, 0.05, 0.02, 0.02, 0.01},
            new String[]{"kg", "kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-007") != null && !existingBOMsMap.containsKey(productosMap.get("PT-007").getId())) {
            createBOMForProduct(productosMap.get("PT-007"), "SMART BOLSA 13.01 LB", admin, productosMap,
            new String[]{"MP-001", "MP-002", "MP-003", "MP-004", "MP-005", "MP-006"},
            new double[]{0.70, 0.20, 0.05, 0.02, 0.02, 0.01},
            new String[]{"kg", "kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-008") != null && !existingBOMsMap.containsKey(productosMap.get("PT-008").getId())) {
            createBOMForProduct(productosMap.get("PT-008"), "LA WEY 1.72 LB", admin, productosMap,
            new String[]{"MP-002", "MP-003", "MP-004", "MP-005", "MP-006"},
            new double[]{0.90, 0.05, 0.02, 0.02, 0.01},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        // BOMs para creatinas
        if (productosMap.get("PT-009") != null && !existingBOMsMap.containsKey(productosMap.get("PT-009").getId())) {
            createBOMForProduct(productosMap.get("PT-009"), "LEGACY 30S CREATINA HCL", admin, productosMap,
            new String[]{"MP-006", "MP-007"},
            new double[]{0.95, 0.05},
            new String[]{"kg", "kg"});
        }

        if (productosMap.get("PT-010") != null && !existingBOMsMap.containsKey(productosMap.get("PT-010").getId())) {
            createBOMForProduct(productosMap.get("PT-010"), "LEGACY 50S CREATINA HCL", admin, productosMap,
            new String[]{"MP-006", "MP-007"},
            new double[]{0.95, 0.05},
            new String[]{"kg", "kg"});
        }

        if (productosMap.get("PT-011") != null && !existingBOMsMap.containsKey(productosMap.get("PT-011").getId())) {
            createBOMForProduct(productosMap.get("PT-011"), "LEGACY PLUS 50S", admin, productosMap,
            new String[]{"MP-006", "MP-007", "MP-010"},
            new double[]{0.85, 0.10, 0.05},
            new String[]{"kg", "kg", "kg"});
        }

        if (productosMap.get("PT-012") != null && !existingBOMsMap.containsKey(productosMap.get("PT-012").getId())) {
            createBOMForProduct(productosMap.get("PT-012"), "LEGEND CON CREAPURE®", admin, productosMap,
            new String[]{"MP-006"},
            new double[]{1.0},
            new String[]{"kg"});
        }

        if (productosMap.get("PT-013") != null && !existingBOMsMap.containsKey(productosMap.get("PT-013").getId())) {
            createBOMForProduct(productosMap.get("PT-013"), "LEGEND CON CREAPURE® 50s", admin, productosMap,
            new String[]{"MP-006"},
            new double[]{1.0},
            new String[]{"kg"});
        }

        // BOMs para suplementos
        if (productosMap.get("PT-014") != null && !existingBOMsMap.containsKey(productosMap.get("PT-014").getId())) {
            createBOMForProduct(productosMap.get("PT-014"), "EEA'S (ARMY) 30 SERVICIOS", admin, productosMap,
            new String[]{"MP-008", "MP-009", "MP-010", "MP-011", "MP-012"},
            new double[]{0.40, 0.35, 0.20, 0.03, 0.02},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-015") != null && !existingBOMsMap.containsKey(productosMap.get("PT-015").getId())) {
            createBOMForProduct(productosMap.get("PT-015"), "INTENZE 30 SERVICIOS", admin, productosMap,
            new String[]{"MP-011", "MP-012", "MP-013", "MP-014", "MP-001", "MP-002"},
            new double[]{0.30, 0.25, 0.20, 0.15, 0.05, 0.05},
            new String[]{"kg", "kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-016") != null && !existingBOMsMap.containsKey(productosMap.get("PT-016").getId())) {
            createBOMForProduct(productosMap.get("PT-016"), "THE ONE", admin, productosMap,
            new String[]{"MP-010", "MP-011", "MP-012", "MP-013", "MP-014"},
            new double[]{0.20, 0.15, 0.30, 0.20, 0.15},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-017") != null && !existingBOMsMap.containsKey(productosMap.get("PT-017").getId())) {
            createBOMForProduct(productosMap.get("PT-017"), "OMEGA 3", admin, productosMap,
            new String[]{"MP-001", "MP-002"},
            new double[]{0.90, 0.10},
            new String[]{"kg", "kg"});
        }

        // Los kits no tienen BOM directo, son combinaciones de productos terminados
        // Pero podemos crear BOMs básicos para ellos
        if (productosMap.get("PT-018") != null && !existingBOMsMap.containsKey(productosMap.get("PT-018").getId())) {
            createBOMForProduct(productosMap.get("PT-018"), "KIT GYMBRO", admin, productosMap,
            new String[]{"MP-001", "MP-006", "MP-007", "MP-008"},
            new double[]{0.60, 0.30, 0.05, 0.05},
            new String[]{"kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-019") != null && !existingBOMsMap.containsKey(productosMap.get("PT-019").getId())) {
            createBOMForProduct(productosMap.get("PT-019"), "KIT GYM RAT", admin, productosMap,
            new String[]{"MP-001", "MP-006", "MP-008", "MP-009", "MP-010"},
            new double[]{0.50, 0.25, 0.15, 0.05, 0.05},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        if (productosMap.get("PT-020") != null && !existingBOMsMap.containsKey(productosMap.get("PT-020").getId())) {
            createBOMForProduct(productosMap.get("PT-020"), "KIT ESSENTIAL", admin, productosMap,
            new String[]{"MP-001", "MP-006", "MP-008", "MP-010", "MP-011"},
            new double[]{0.40, 0.20, 0.20, 0.15, 0.05},
            new String[]{"kg", "kg", "kg", "kg", "kg"});
        }

        System.out.println("BOMs verificados y creados solo para productos que no tenían BOM");
    }

    private void createBOMForProduct(Product producto, String nombreBOM, User creador, 
                                     java.util.Map<String, Product> productosMap,
                                     String[] codigosMateriales, double[] porcentajes,
                                     String[] unidades) {
        if (producto == null) {
            System.out.println("Producto no encontrado para crear BOM");
            return;
        }

        List<Material> allMaterials = materialRepository.findAll();
        java.util.Map<String, Material> materialesMap = new java.util.HashMap<>();
        for (Material m : allMaterials) {
            materialesMap.put(m.getCodigo(), m);
        }

        BOM bom = new BOM();
        bom.setProducto(producto);
        bom.setVersion("1.0");
        bom.setEstado(EstadoBOM.APROBADO);
        bom.setJustificacion("BOM inicial creado automáticamente para " + nombreBOM);
        bom.setCreador(creador);
        bom.setAprobador(creador);
        bom.setApprovedAt(java.time.LocalDateTime.now());

        bom = bomRepository.save(bom);

        List<BOMItem> items = new ArrayList<>();
        double totalPorcentaje = 0.0;

        for (int i = 0; i < codigosMateriales.length; i++) {
            Material material = materialesMap.get(codigosMateriales[i]);
            if (material == null) {
                System.out.println("Material no encontrado: " + codigosMateriales[i]);
                continue;
            }

            BOMItem item = new BOMItem();
            item.setBom(bom);
            item.setMaterial(material);
            
            // Calcular cantidad basada en porcentaje
            // Para kg: cantidad en kg, para g: cantidad en gramos
            BigDecimal cantidad;
            if (unidades[i].equals("kg")) {
                cantidad = BigDecimal.valueOf(porcentajes[i]); // Porcentaje directo en kg
            } else {
                cantidad = BigDecimal.valueOf(porcentajes[i] * 1000.0); // Convertir a gramos
            }
            item.setCantidad(cantidad);
            item.setUnidad(unidades[i]);
            item.setPorcentaje(BigDecimal.valueOf(porcentajes[i] * 100.0));
            item.setSecuencia(i + 1);

            items.add(item);
            totalPorcentaje += porcentajes[i];
        }

        // Ajustar porcentajes si no suman exactamente 100%
        if (Math.abs(totalPorcentaje - 1.0) > 0.01) {
            double factor = 1.0 / totalPorcentaje;
            for (BOMItem item : items) {
                BigDecimal nuevoPorcentaje = item.getPorcentaje().multiply(BigDecimal.valueOf(factor));
                item.setPorcentaje(nuevoPorcentaje);
            }
        }

        bomItemRepository.saveAll(items);
    }
}

