package com.gamehub.service;

import com.gamehub.dto.ComentarioRequestDTO;
import com.gamehub.model.Comentario;
import com.gamehub.model.Jogo;
import com.gamehub.model.Usuario;
import com.gamehub.repository.ComentarioRepository;
import com.gamehub.repository.JogoRepository;
import com.gamehub.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComentarioServiceTest {
    @Mock ComentarioRepository comentarioRepository;
    @Mock JogoRepository jogoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks ComentarioService service;

    @Test
    void adicionaComentarioComTextoNormalizado() {
        Jogo jogo = new Jogo(); jogo.setId(3L);
        Usuario usuario = new Usuario("Ana", "ana@example.com", "senha"); usuario.setId(4L);
        Comentario salvo = new Comentario("Bom jogo", jogo, usuario); salvo.setId(8L);
        when(jogoRepository.findById(3L)).thenReturn(Optional.of(jogo));
        when(usuarioRepository.findById(4L)).thenReturn(Optional.of(usuario));
        when(comentarioRepository.save(any(Comentario.class))).thenReturn(salvo);

        var response = service.adicionarComentario(new ComentarioRequestDTO("  Bom jogo  ", 3L, 4L));

        var captor = ArgumentCaptor.forClass(Comentario.class);
        verify(comentarioRepository).save(captor.capture());
        assertThat(captor.getValue().getTexto()).isEqualTo("Bom jogo");
        assertThat(response.id()).isEqualTo(8L);
        assertThat(response.nomeUsuario()).isEqualTo("Ana");
    }

    @Test
    void rejeitaTextoVazioSemConsultarRepositorios() {
        assertThatThrownBy(() -> service.adicionarComentario(new ComentarioRequestDTO(" ", 1L, 2L)))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("400 BAD_REQUEST");
        verifyNoInteractions(jogoRepository, usuarioRepository, comentarioRepository);
    }

    @Test
    void rejeitaJogoOuUsuarioInexistente() {
        when(jogoRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.adicionarComentario(new ComentarioRequestDTO("texto", 1L, 2L)))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("404 NOT_FOUND");

        Jogo jogo = new Jogo(); jogo.setId(1L);
        when(jogoRepository.findById(1L)).thenReturn(Optional.of(jogo));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.adicionarComentario(new ComentarioRequestDTO("texto", 1L, 2L)))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void listaComentariosPorJogo() {
        Jogo jogo = new Jogo(); jogo.setId(1L);
        Usuario usuario = new Usuario("Ana", "ana@example.com", "senha"); usuario.setId(2L);
        when(comentarioRepository.findByJogoIdOrderByDataCriacaoDesc(1L))
            .thenReturn(List.of(new Comentario("texto", jogo, usuario)));

        assertThat(service.listarPorJogo(1L)).singleElement()
            .satisfies(dto -> assertThat(dto.texto()).isEqualTo("texto"));
    }
}