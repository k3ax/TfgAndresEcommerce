package com.andres.ecommerce.controller;

import com.andres.ecommerce.model.Valoracion;
import com.andres.ecommerce.repository.ValoracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/valoraciones")
@CrossOrigin(origins = "*") // Para que tu JS pueda conectar sin bloqueos
public class ValoracionController {

    @Autowired
    private ValoracionRepository valoracionRepository;

    // Obtener comentarios de un producto
    @GetMapping("/producto/{productoId}")
    public List<Valoracion> obtenerComentarios(@PathVariable Long productoId) {
        return valoracionRepository.findByProductoId(productoId);
    }

    // Guardar un nuevo comentario
    @PostMapping
    public Valoracion crearValoracion(@RequestBody Valoracion valoracion) {
        return valoracionRepository.save(valoracion);
    }



    @GetMapping
    public List<Valoracion> listarTodas() {
        return valoracionRepository.findAll();
    }


    @DeleteMapping("/{id}")
    public void eliminarValoracion(@PathVariable Long id) {
        valoracionRepository.deleteById(id);
    }
}
