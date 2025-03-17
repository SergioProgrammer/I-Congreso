require('dotenv').config(); // Asegúrate de requerir dotenv al inicio

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configura el transportador de Nodemailer usando variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes usar otro servicio si prefieres
  auth: {
    user: process.env.EMAIL_USER, // Usa la variable de entorno para el correo
    pass: process.env.EMAIL_PASS,  // Usa la variable de entorno para la contraseña
  },
});

// Ruta para manejar el envío del formulario
app.post('/submit', (req, res) => {
  const { name, email, comments } = req.body;

  // Manejo de archivo si es necesario (debes usar multer o similar para esto)
  // const document = req.files.document; 

  // Configura el correo
  const mailOptions = {
    from: process.env.EMAIL_USER, // Usa la variable de entorno para el correo
    to: 'saraquintanadg@gmail.com',
    subject: 'Nuevo Proyecto Enviado',
    text: `Nombre: ${name}\nCorreo: ${email}\nComentarios: ${comments}`,
    // Si manejas archivos, incluye esto:
    // attachments: [
    //   {
    //     filename: document.name,
    //     content: document.data,
    //   },
    // ],
  };

  // Envía el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error al enviar el correo');
    }
    res.status(200).send('Formulario enviado correctamente');
  });
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
