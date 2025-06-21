import express from 'express'

import { parse_products } from '~/services/scrape'

const router = express.Router()

// random post request
router.post('/parsepage', async (req, res) => {
    try {

        const data = req.body
        // console.log(data)

        if (!data || !data.html) {
            return res.status(400).json({ error: "Missing HTML content in request body" });
        }

        console.log("Parsing HTML content...")
        const response = await parse_products(data.html)

        res.status(200).json({ products: response })

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