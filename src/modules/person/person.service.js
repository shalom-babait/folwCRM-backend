import * as personRepo from './person.repo.js';

export async function createPersonService(personData, organizationId = null) {
  // אפשר להוסיף ולידציה נוספת כאן אם צריך
  return await personRepo.createPerson(personData, organizationId);
}

export async function getAllPersonsService(organizationId = null) {
  return await personRepo.getAllPersons(organizationId);
}

export async function getPersonByIdService(person_id, organizationId = null) {
  return await personRepo.getPersonById(person_id, organizationId);
}

export async function updatePersonService(person_id, personData, organizationId = null) {
  return await personRepo.updatePerson(person_id, personData, organizationId);
}

export async function deletePersonService(person_id, organizationId = null) {
  return await personRepo.deletePerson(person_id, organizationId);
}
