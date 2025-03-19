import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para almacenar archivos temporalmente
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/send-email', upload.single('document'), async (req, res) => {
    try {
        const { name, email, comments } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).send("No se ha subido ningún archivo.");
        }

        // Configuración de transporte de correo con Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu correo
                pass: process.env.EMAIL_PASS, // Tu contraseña o App Password de Gmail
            }
        });

        // Configuración del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "sergiosanpacheco@gmail.com",
            subject: "Nueva contribución de proyecto",
            text: `Nombre: ${name}\nEmail: ${email}\nComentarios: ${comments}`,
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer
                }
            ]
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        res.status(200).send("Correo enviado correctamente.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al enviar el correo.");
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
