package com.andres.ecommerce.controller;

import com.andres.ecommerce.model.Usuario;
import com.andres.ecommerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Permite que el Frontend Vanilla JS se conecte
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Endpoint para el Registro de nuevos usuarios.
     * Los usuarios se registran como básicos por defecto (Requisito TFG).
     */
    @PostMapping("/registro")
    public Usuario registrarUsuario(@RequestBody Usuario usuario) {
        // Forzamos el rol USER_BASIC antes de guardar
        usuario.setRol(Usuario.Rol.USER_BASIC);
        return usuarioRepository.save(usuario);
    }

    /**
     * Endpoint para el Login de usuarios.
     * Verifica que el username exista y la contraseña coincida.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario datosLogin) {
        // Buscamos al usuario por su nombre de usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(datosLogin.getUsername());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // Verificamos si la contraseña coincide (en texto plano por ahora)
            if (usuario.getPassword().equals(datosLogin.getPassword())) {
                // Si todo es correcto, devolvemos el usuario (incluyendo su ID y ROL)
                return ResponseEntity.ok(usuario);
            }
        }

        // Si falla, devolvemos un error 401 (No autorizado)
        return ResponseEntity.status(401).body("Usuario o contraseña incorrectos");
    }
}