package com.andres.ecommerce.repository;

import com.andres.ecommerce.model.Valoracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {
    // Método para obtener todas las valoraciones de un producto concreto
    List<Valoracion> findByProductoId(Long productoId);
}