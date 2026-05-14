package com.andres.ecommerce.controller;

import com.andres.ecommerce.model.Producto;
import com.andres.ecommerce.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*") // Permite la comunicación con el frontend de JS
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    /**
     * 1. Catálogo: Lista todos los productos disponibles.
     * Se usa en index.html, admin.html y carrito.html.
     */
    @GetMapping
    public List<Producto> listar() {
        return productoRepository.findAll();
    }

    /**
     * 2. Gestión Admin: Crea un nuevo producto o actualiza uno existente.
     * Se usa desde el formulario del panel de administrador.
     */
    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    /**
     * 3. Gestión Admin: Elimina un producto por su ID.
     */
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoRepository.deleteById(id);
    }

    /**
     * 4. Lógica de Venta: Descuenta stock tras una compra (Requisito TFG).
     * Este es el cambio que conecta con la acción del carrito.
     */
    @PostMapping("/{id}/comprar")
    public ResponseEntity<?> comprar(@PathVariable Long id) {
        return productoRepository.findById(id).map(producto -> {
            // Verificamos que haya unidades antes de vender
            if (producto.getStock() > 0) {
                producto.setStock(producto.getStock() - 1);
                productoRepository.save(producto);
                return ResponseEntity.ok().build();
            } else {
                // Si el stock es 0, enviamos un error 400
                return ResponseEntity.badRequest().body("Producto agotado");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}