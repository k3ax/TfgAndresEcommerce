package com.andres.ecommerce.repository;

import com.andres.ecommerce.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p")
    Double sumarIngresosTotales();

    @Query("SELECT COUNT(p) FROM Pedido p")
    Long contarTotalPedidos();


    @Query("SELECT CAST(p.fecha AS date) as dia, SUM(p.total) FROM Pedido p GROUP BY CAST(p.fecha AS date) ORDER BY dia ASC")
    List<Object[]> obtenerVentasPorDia();
}