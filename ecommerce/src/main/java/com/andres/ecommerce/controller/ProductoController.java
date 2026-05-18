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

    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        if (producto.getActivo() == null) {
            producto.setActivo(true);
        }
        return productoRepository.save(producto);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> ocultar(@PathVariable Long id) {
        return productoRepository.findById(id).map(producto -> {
            producto.setActivo(false);
            productoRepository.save(producto);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }


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