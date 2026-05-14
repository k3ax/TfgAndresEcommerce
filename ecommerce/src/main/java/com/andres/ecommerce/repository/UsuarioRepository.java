package com.andres.ecommerce.repository;

import com.andres.ecommerce.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Este método nos servirá después para el Login
    Optional<Usuario> findByUsername(String username);
}