package com.andres.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "valoraciones")
@Data
public class Valoracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String comentario;

    @Column(nullable = false)
    private int estrellas; // Puntuación de 1 a 5

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // Relación con la tabla usuarios

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto; // Relación con la tabla productos
}
