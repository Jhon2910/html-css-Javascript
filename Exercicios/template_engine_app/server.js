const http = require("http");
const livros = [
 {
 id: 1,
 titulo: "Clean Code",
 autor: "Robert C. Martin",
 preco: 89.90,
 quantidade: 5,
 promocao: true
 },
 {
 id: 2,
 titulo: "O Hobbit",
 autor: "J. R. R. Tolkien",
 preco: 49.90,
 quantidade: 7,
 promocao: false
 },
 {
 id: 3,
 titulo: "1984",
autor: "George Orwell",
 preco: 39.90,
 quantidade: 0,
 promocao: false
 }
 
]

const server = http.createServer((req, res) => {
 res.writeHead(200, {
 "Content-Type": "text/html; charset=utf-8"
 });
 res.end(`
 <!DOCTYPE html>
 <html lang="pt-BR">
 <head>
 <meta charset="UTF-8">
 <title>Livraria</title>
 </head>
 <body>
 <h1>Livraria</h1>
 <h2>Clean Code</h2>
 <p>Robert C. Martin</p>
 <p>R$ 89,90</p>
 <h2>O Hobbit</h2>
 <p>J. R. R. Tolkien</p>
 <p>R$ 49,90</p>
 <h2>1984</h2>
 <p>George Orwell</p>
 <p>R$ 39,90</p>
 </body>
 </html>
 `);
});
server.listen(3000, () => {
 console.log("Servidor rodando em http://localhost:3000");
});