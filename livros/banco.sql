create table livro (
    id int not null auto_increment primary key,
    titulo varchar(255) not null,
    autor varchar(255) not null,
    ano integer not null,
    capa varchar(255) not null
);

INSERT INTO livros (titulo, autor, ano, capa) VALUES
('O despertar de tudo', 'David Graeber; David Wengrow', 2021, 'capas/davidgraeber.jpg'),
('O Senhor dos Aneis', 'JRR Tolkien', 1970, 'capas/osenhordosaneis.jpg');