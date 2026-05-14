package com.andres.ecommerce.controller;

import com.andres.ecommerce.model.Producto;
import com.andres.ecommerce.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    /**
     * 1. Listado de productos.
     * Si 'soloActivos' es true (por defecto), solo devuelve los que no están ocultos.
     */
    @GetMapping
    public List<Producto> listar(@RequestParam(required = false, defaultValue = "true") boolean soloActivos) {
        List<Producto> todos = productoRepository.findAll();

        if (soloActivos) {
            return todos.stream()
                    .filter(p -> p.getActivo() == null || p.getActivo())
                    .collect(Collectors.toList());
        }
        return todos;
    }

    /**
     * 2. Crear o Actualizar producto.
     * Si el JSON incluye un 'id', JPA actualizará el producto automáticamente.
     */
    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        if (producto.getActivo() == null) {
            producto.setActivo(true);
        }
        return productoRepository.save(producto);
    }

    /**
     * 3. Soft Delete: Oculta el producto de la vista pública.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> ocultar(@PathVariable Long id) {
        return productoRepository.findById(id).map(producto -> {
            producto.setActivo(false);
            productoRepository.save(producto);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * 4. Reactivar: Vuelve a hacer visible un producto oculto.
     */
    @PutMapping("/{id}/reactivar")
    public ResponseEntity<?> reactivar(@PathVariable Long id) {
        return productoRepository.findById(id).map(producto -> {
            producto.setActivo(true);
            productoRepository.save(producto);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/comprar")
    public ResponseEntity<?> comprar(@PathVariable Long id) {
        return productoRepository.findById(id).map(producto -> {
            if (producto.getStock() > 0) {
                producto.setStock(producto.getStock() - 1);
                productoRepository.save(producto);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().body("Producto agotado");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}