import { create, getRooms } from "./rooms.repo.js";

export const fetchRooms = async () => {
    try {
        const therapists = await getRooms();
        return therapists;
    } catch (error) {
        throw error;
    }

};

export async function createRoom(roomData) {
    try {
        const newRoom = await create(roomData);
        return newRoom;
    } catch (error) {
        throw error;
    }
}