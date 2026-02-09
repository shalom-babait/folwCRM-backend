import { getAllOrganizations } from './organization.repo.js';

export async function getAllOrganizationsService() {
	return await getAllOrganizations();
}
import { createOrganization } from './organization.repo.js';
import { createPerson } from '../person/person.repo.js';
import { createUser } from '../users/users.repo.js';

export async function createOrganizationService(payload) {
	// payload: { organization, person, user }
	// 1. Create person
	const personResult = await createPerson(payload.person);
	// 2. Create user (attach person_id if needed)
	const userData = { ...payload.user, person_id: personResult.person_id };
	const userResult = await createUser(userData);
	// 3. Create organization (attach owner_user_id)
	const orgData = { ...payload.organization, owner_user_id: userResult.user_id };
	const orgResult = await createOrganization(orgData);
	return {
		organization: orgResult,
		person: personResult,
		user: userResult
	};
}
