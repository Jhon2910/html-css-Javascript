import express from 'express';
import multer from 'multer';
import path from 'path';
import { createTicket } from './ticketController.js';

const app = express();
app.use(express.json());

// Configuração de Armazenamento do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Garanta que esta pasta exista na raiz do projeto
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de segurança de arquivos (Bloqueia executáveis conforme RN04)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('ExtensionNotAllowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por arquivo
}).array('attachments', 3); // Máximo de 3 arquivos por chamado

// Middleware wrapper para capturar erros de upload do Multer de forma limpa
const handleUploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'FileSizeExceeded', message: 'O arquivo excede o limite máximo de 5MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, error: 'FileCountExceeded', message: 'Permitido no máximo 3 arquivos anexados.' });
      }
    } else if (err && err.message === 'ExtensionNotAllowed') {
      return res.status(415).json({ success: false, error: 'UnsupportedMediaType', message: 'Permitido apenas arquivos PDF, JPG e PNG.' });
    } else if (err) {
      return res.status(400).json({ success: false, error: 'UploadError', message: 'Falha ao processar arquivos de anexo.' });
    }
    next();
  });
};

// Rota de criação definida na especificação
app.post('/api/v1/tickets', handleUploadMiddleware, createTicket);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
