package com.andres.ecommerce.controller;

import com.andres.ecommerce.model.Pedido;
import com.andres.ecommerce.model.Producto;
import com.andres.ecommerce.model.Usuario;
import com.andres.ecommerce.repository.PedidoRepository;
import com.andres.ecommerce.repository.ProductoRepository;
import com.andres.ecommerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ProductoRepository productoRepository;

    @PostMapping
    public Pedido crearPedido(@RequestBody Map<String, Object> datos) {
        Long usuarioId = Long.valueOf(datos.get("usuarioId").toString());
        List<Integer> productosIds = (List<Integer>) datos.get("productosIds");
        Double total = Double.valueOf(datos.get("total").toString());

        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        List<Producto> productos = productoRepository.findAllById(
                productosIds.stream().map(Long::valueOf).collect(Collectors.toList())
        );

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setProductos(productos);
        pedido.setTotal(total);
        pedido.setFecha(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Pedido> listarPorUsuario(@PathVariable Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuarioId);
    }

    @GetMapping("/estadisticas")
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("ingresosTotales", pedidoRepository.sumarIngresosTotales());
        stats.put("numeroPedidos", pedidoRepository.contarTotalPedidos());
        stats.put("clientesRegistrados", usuarioRepository.count());
        stats.put("productosCatalogo", productoRepository.count());
        stats.put("ventasDiarias", pedidoRepository.obtenerVentasPorDia());
        return stats;
    }
}