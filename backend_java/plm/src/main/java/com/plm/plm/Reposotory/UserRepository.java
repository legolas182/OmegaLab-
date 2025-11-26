package com.plm.plm.Reposotory;

<<<<<<< HEAD
import com.plm.plm.Enums.EstadoUsuario;
import com.plm.plm.Enums.Rol;
=======
>>>>>>> origin/main
import com.plm.plm.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> origin/main
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
<<<<<<< HEAD
    List<User> findByRolAndEstado(Rol rol, EstadoUsuario estado);
=======
>>>>>>> origin/main
}

