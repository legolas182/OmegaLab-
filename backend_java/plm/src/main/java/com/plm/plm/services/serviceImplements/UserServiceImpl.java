package com.plm.plm.services.serviceImplements;


import com.plm.plm.Config.exception.ResourceNotFoundException;
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Enums.Rol;
import com.plm.plm.Models.User;
import com.plm.plm.Reposotory.UserRepository;
import com.plm.plm.dto.UserDTO;
import com.plm.plm.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setNombre(userDTO.getNombre());
        user.setRol(userDTO.getRol());
        user.setEstado(userDTO.getEstado());
        return userRepository.save(user).getDTO();
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(User::getDTO)
                .toList();
    }

    @Override
    public UserDTO updateUser(Integer id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        user.setEmail(userDTO.getEmail());
        user.setNombre(userDTO.getNombre());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRol(userDTO.getRol());
        user.setEstado(userDTO.getEstado());

        return userRepository.save(user).getDTO();
    }

    @Override
    public UserDTO deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        user.setEstado(EstadoUsuario.INACTIVO);
        return userRepository.save(user).getDTO();
    }

    @Override
    public UserDTO getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id))
                .getDTO();
    }


    @Override
    public List<UserDTO> getUsersByRol(Rol rol) {
        return userRepository.findByRolAndEstado(rol, EstadoUsuario.ACTIVO).stream()
                .map(User::getDTO)
                .toList();
    }

}

