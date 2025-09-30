import { create, getTypes } from "./types.repo.js";

export const fetchTypes = async () => {
    try {
        const types = await getTypes();
        return types;
    } catch (error) {
        throw error;
    }

};

export async function createType(typeData) {
    try {
        const newType = await create(typeData);
        return newType;
    } catch (error) {
        throw error;
    }
}