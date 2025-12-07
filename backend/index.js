import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());

// Endpoint de usuario
app.get("/api/user/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
            headers: { "Authorization": `Bot ${process.env.BOT_TOKEN}` }
        });

        const text = await response.text();
        let user;
        try { user = JSON.parse(text); } 
        catch { return res.status(400).json({ error: "Usuario no encontrado" }); }

        if (!response.ok) {
            return res.status(response.status).json({ error: user.message || "Usuario no encontrado" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint de Invitación
app.get("/api/invite/:code", async (req, res) => {
    const code = req.params.code;
    const apiUrl = `https://discord.com/api/v10/invites/${code}?with_counts=true`; 

    try {
        const response = await fetch(apiUrl, {
            headers: { "Authorization": `Bot ${process.env.BOT_TOKEN}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Error desconocido de Discord" }));
            
            if (response.status === 404) {
                return res.status(404).json({ error: "Código de invitación no válido o caducado" });
            }
            return res.status(response.status).json({ error: errorData.message || "Error al obtener datos de la invitación" });
        }

        const inviteData = await response.json();
        

        if (inviteData.guild) {
            return res.json(inviteData.guild); 
        }

        res.json({ error: "La invitación es para un grupo, no un servidor", data: inviteData });

    } catch (err) {
        res.status(500).json({ error: `Error interno del servidor: ${err.message}` });
    }
});

app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
