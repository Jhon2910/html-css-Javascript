package com.gamehub.controller;

import com.gamehub.dto.ComentarioRequestDTO;
import com.gamehub.dto.ComentarioResponseDTO;
import com.gamehub.service.ComentarioService;
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
class ComentarioControllerTest {
    @Mock ComentarioService comentarioService;
    @InjectMocks ComentarioController controller;

    @Test
    void adicionarRetorna201() {
        ComentarioResponseDTO response = new ComentarioResponseDTO(1L, "texto", null, 2L, 3L, "Ana");
        when(comentarioService.adicionarComentario(any())).thenReturn(response);

        var result = controller.adicionar(new ComentarioRequestDTO("texto", 2L, 3L));

        assertThat(result.getStatusCode().value()).isEqualTo(201);
        assertThat(result.getBody()).isSameAs(response);
    }

    @Test
    void listaPorJogoRetorna200() {
        when(comentarioService.listarPorJogo(2L)).thenReturn(List.of());

        var result = controller.listarPorJogo(2L);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        verify(comentarioService).listarPorJogo(2L);
    }
}