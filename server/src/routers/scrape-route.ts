import express from 'express'

import { parse_products, parse_products_json } from '~/services/scrape'

const router = express.Router()

// random post request
router.post('/parsepage', async (req, res) => {
    try {

        const data = req.body
        // console.log(data)

        if (!data || !data.html || !data.baseUrl) {
            return res.status(400).json({ error: "Missing HTML content in request body" });
        }

        console.log("Parsing HTML content...")
        const response = await parse_products(data.html, data.baseUrl)

        res.status(200).json(response)

    } catch (e:any) {
        console.warn("Error", e)
        res.status(500).json({error: e.message || "server error"})
    }
})

// router.get('/test', async (req, res) => {
//     try {
//         res.status(200).json({status: 'cool test'})
//     } catch (e:any) {
//         console.warn("Error", e)
//         res.status(500).json({error: e.message || "server error"})
//     }
// })

export const scrape = router