package com.andres.ecommerce.repository;

import com.andres.ecommerce.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Al extender de JpaRepository, ya tienes: save(), findAll(), findById(), delete()...
}
