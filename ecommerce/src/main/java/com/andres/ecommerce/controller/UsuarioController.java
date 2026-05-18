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

    @PostMapping("/registro")
    public Usuario registrarUsuario(@RequestBody Usuario usuario) {
        // Forzamos el rol USER_BASIC antes de guardar
        usuario.setRol(Usuario.Rol.USER_BASIC);
        return usuarioRepository.save(usuario);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario datosLogin) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(datosLogin.getUsername());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();


            if (usuario.getPassword().equals(datosLogin.getPassword())) {

                return ResponseEntity.ok(usuario);
            }
        }


        return ResponseEntity.status(401).body("Usuario o contraseña incorrectos");
    }
}