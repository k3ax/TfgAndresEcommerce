package com.andres.ecommerce.repository;

import com.andres.ecommerce.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Método para obtener el historial de un usuario
    List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    // --- NUEVAS CONSULTAS PARA EL DASHBOARD ---

    // 1. Suma el total de todos los pedidos (COALESCE evita errores si no hay pedidos aún)
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p")
    Double sumarIngresosTotales();

    // 2. Cuenta cuántos pedidos se han hecho en total
    @Query("SELECT COUNT(p) FROM Pedido p")
    Long contarTotalPedidos();
}