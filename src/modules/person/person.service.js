import * as personRepo from './person.repo.js';

export async function createPersonService(personData) {
  // אפשר להוסיף ולידציה נוספת כאן אם צריך
  return await personRepo.createPerson(personData);
}

export async function getAllPersonsService() {
  return await personRepo.getAllPersons();
}

export async function getPersonByIdService(person_id) {
  return await personRepo.getPersonById(person_id);
}

export async function updatePersonService(person_id, personData) {
  return await personRepo.updatePerson(person_id, personData);
}

export async function deletePersonService(person_id) {
  return await personRepo.deletePerson(person_id);
}
