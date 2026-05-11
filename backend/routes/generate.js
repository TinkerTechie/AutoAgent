const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { prompt } = req.body;

        console.log("Incoming Prompt:");
        console.log(prompt);

        res.json({
            success: true,
            message: "Generation route working",
            prompt
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;