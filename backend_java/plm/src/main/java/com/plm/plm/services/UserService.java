package com.plm.plm.services;

import com.plm.plm.Enums.EstadoUsuario;
<<<<<<< HEAD
import com.plm.plm.Enums.Rol;
=======
>>>>>>> origin/main
import com.plm.plm.Models.User;
import com.plm.plm.dto.UserDTO;

import java.util.List;

public interface UserService {
    UserDTO createUser(UserDTO userDTO);
    List<UserDTO> getAllUsers();
    UserDTO updateUser(Integer id, UserDTO userDTO);
    UserDTO deleteUser(Integer id);
    UserDTO getUserById(Integer id);
<<<<<<< HEAD
    List<UserDTO> getUsersByRol(Rol rol);
=======
>>>>>>> origin/main
}

