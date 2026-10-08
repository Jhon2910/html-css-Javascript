package com.gamehub.service;

import com.gamehub.dto.UsuarioRequestDTO;
import com.gamehub.model.Usuario;
import com.gamehub.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks UsuarioService service;

    @Test
    void cadastraUsuarioNormalizandoEmailENome() {
        Usuario salvo = new Usuario("Ana", "ana@example.com", "segredo");
        salvo.setId(7L);
        salvo.setDataCadastro(LocalDateTime.now());
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(salvo);

        var response = service.cadastrarUsuario(new UsuarioRequestDTO(" Ana ", " ANA@EXAMPLE.COM ", "segredo"));

        var captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getNome()).isEqualTo("Ana");
        assertThat(captor.getValue().getEmail()).isEqualTo("ana@example.com");
        assertThat(response.id()).isEqualTo(7L);
    }

    @Test
    void rejeitaCamposObrigatoriosVazios() {
        assertThatThrownBy(() -> service.cadastrarUsuario(new UsuarioRequestDTO(" ", "a@b.com", "senha")))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("400 BAD_REQUEST");
        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void rejeitaEmailDuplicado() {
        when(usuarioRepository.existsByEmail("ana@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.cadastrarUsuario(new UsuarioRequestDTO("Ana", "ANA@example.com", "senha")))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("409 CONFLICT");
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void listaEBuscaUsuarios() {
        Usuario usuario = new Usuario("Ana", "ana@example.com", "senha");
        usuario.setId(1L);
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        assertThat(service.listarTodos()).singleElement().satisfies(dto -> assertThat(dto.nome()).isEqualTo("Ana"));
        assertThat(service.buscarPorId(1L).email()).isEqualTo("ana@example.com");
    }

    @Test
    void buscaUsuarioInexistenteRetorna404() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404 NOT_FOUND");
    }
}