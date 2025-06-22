import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Initialize Supabase client using env variables
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

router.post('/savelike', async (req, res) => {
    try {
        const { uid, liked_products } = req.body;
        // console.log(uid, liked_products)
        if (!uid || !Array.isArray(liked_products)) {
            return res.status(400).json({ error: "uid and liked_products[] required" });
        }

        const { data: user, error: userError } = await supabase
            .from('User')
            .select('UserID')
            .eq('Auth_ID', uid)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = user.UserID;
        // console.log(userId)
        // Prepare rows for insert
        const rows = liked_products.map((product: any) => ({
            UserIDF: userId,
            Name_Of_Product: product.name,
            Price: product.price,
            Media_URL: product.media,
            Ecommerce_URL: product.url
        }));

        console.log(rows)

        const { error } = await supabase
            .from('User_liked')
            .insert(rows);

        if (error) {
            console.warn("Supabase insert error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ success: true });
    } catch (e: any) {
        console.warn("Like error:", e);
        res.status(500).json({ error: e.message || "server error" });
    }
});

router.post('/getliked', async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
        return res.status(400).json({ error: "uid required" });
    }

    // Get the user's internal UserID
    const { data: user, error: userError } = await supabase
        .from('User')
        .select('UserID')
        .eq('Auth_ID', uid)
        .single();

    if (userError || !user) {
        return res.status(404).json({ error: "User not found" });
    }

    const userId = user.UserID;

    // Fetch all products in User_liked for this userId
    const { data: likedProducts, error: likedError } = await supabase
        .from('User_liked')
        .select('*')
        .eq('UserIDF', userId);

    if (likedError) {
        console.warn("Supabase select error:", likedError);
        return res.status(500).json({ error: likedError.message });
    }

    res.status(200).json({ products: likedProducts });
});

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