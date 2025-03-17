import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(cors());

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: req.body.items.map(item => ({
                price_data: {
                    currency: "eur",
                    product_data: { name: "Inscripción" },
                    unit_amount: item.price * 100, // Convertir a centavos
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creando la sesión de checkout:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
