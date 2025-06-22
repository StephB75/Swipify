import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Initialize Supabase client using env variables
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

// v1,whsec_WR7Jh7QUhYhH9+SGiMVkJIwK6FHak0gdthhgKHVKRt/j/ExYEODpsoLrKzSuizaKmEpBquP6cbNUFPq6
router.post('/webhook', async (req, res) => {
    try {
        // Supabase sends the new user info in the request body
        const { id: uid, email } = req.body?.record || {};

        // Insert new user into the User table
        const { error } = await supabase
            .from('User')
            .insert([{ Auth_ID: uid, User_Email: email }]);

        if (error) {
            console.warn("Supabase insert error:", error);
            return res.status(500).json({ error: error.message });
        }

        // Respond to Supabase
        res.status(200).json({ received: true });
    } catch (e: any) {
        console.warn("Webhook error:", e);
        res.status(500).json({ error: e.message || "server error" });
    }
});

export const supabase_route = router