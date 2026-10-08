package com.gamehub.controller;

import com.gamehub.dto.UsuarioRequestDTO;
import com.gamehub.dto.UsuarioResponseDTO;
import com.gamehub.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {
    @Mock UsuarioService usuarioService;
    @InjectMocks UsuarioController controller;

    @Test
    void cadastrarRetorna201() {
        UsuarioResponseDTO response = new UsuarioResponseDTO(1L, "Ana", "ana@example.com", null);
        when(usuarioService.cadastrarUsuario(any())).thenReturn(response);

        var result = controller.cadastrar(new UsuarioRequestDTO("Ana", "ana@example.com", "senha"));

        assertThat(result.getStatusCode().value()).isEqualTo(201);
        assertThat(result.getBody()).isSameAs(response);
    }

    @Test
    void listaERetornaUsuarioPorIdCom200() {
        UsuarioResponseDTO response = new UsuarioResponseDTO(1L, "Ana", "ana@example.com", null);
        when(usuarioService.listarTodos()).thenReturn(List.of(response));
        when(usuarioService.buscarPorId(1L)).thenReturn(response);

        assertThat(controller.listarTodos().getStatusCode().value()).isEqualTo(200);
        assertThat(controller.buscarPorId(1L).getBody()).isSameAs(response);
    }
}