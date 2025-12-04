import { createType, deleteType, fetchTypes, updateType } from "./types.service.js";
export async function getTypesController(req, res) {
    try {
        const { patientId } = req.params;
        if (!patientId || isNaN(patientId)) {
            return res.status(400).json({ message: "Missing or invalid patientId" });
        }
        const types = await fetchTypes(Number(patientId));
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

export async function deleteTypeController(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID"
            });
        }
        const result = await deleteType(id);
        if (result) {
            res.json({
                success: true,
                message: "Type deleted successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Type not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error deleting Type"
        });
    }
}

export async function updateTypeController(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID"
            });
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No update data provided"
            });
        }

        const result = await updateType(id, updateData);
        if (result) {
            res.json({
                success: true,
                message: "Type updated successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Type not found or no changes made"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error updating Type"
        });
        console.log(error.message);

    }
}