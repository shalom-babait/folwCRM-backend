import { createType, fetchTypes } from "./types.service.js";

export async function getTypesController(req, res) {
    try {
        const types = await fetchTypes();
        res.json(types);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function createTypeController(req, res) {
    try {
        const newType = await createType(req.body);

        res.status(201).json({
            success: true,
            data: newType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}