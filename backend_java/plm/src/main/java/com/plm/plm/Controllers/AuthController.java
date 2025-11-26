package com.plm.plm.Controllers;

import com.plm.plm.Config.Exception.DuplicateResourceException;
import com.plm.plm.Config.exception.UnauthorizedException;
import com.plm.plm.Reposotory.UserRepository;
import com.plm.plm.dto.UserDTO;
import com.plm.plm.security.JwtTokenProvider;
import com.plm.plm.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        // Verificar si el usuario ya existe
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("El usuario con ese email ya existe");
        }

        // Crear el usuario usando el método existente
        UserDTO createdUser = userService.createUser(userDTO);

        // Generar token
        String token = jwtTokenProvider.generateToken(
            createdUser.getId(),
            createdUser.getEmail(),
            createdUser.getRol().toString()
        );

        // Construir respuesta
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("user", createdUser);
        data.put("token", token);
        response.put("data", data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        // Buscar usuario por email
        var userOpt = userRepository.findByEmail(userDTO.getEmail());
        if (userOpt.isEmpty()) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        var user = userOpt.get();
        
        // Verificar contraseña
        if (!passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        // Generar token
        String token = jwtTokenProvider.generateToken(
            user.getId(),
            user.getEmail(),
            user.getRol().toString()
        );

        // Construir respuesta
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("user", user.getDTO());
        data.put("token", token);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Buscar usuario por email
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new com.plm.plm.Config.exception.ResourceNotFoundException("Usuario no encontrado");
        }

        UserDTO userDTO = userOpt.get().getDTO();
        Map<String, Object> response = new HashMap<>();
        Map<String, UserDTO> data = new HashMap<>();
        data.put("user", userDTO);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}

