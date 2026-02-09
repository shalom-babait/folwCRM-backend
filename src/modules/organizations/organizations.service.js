import { getAllOrganizations } from './organization.repo.js';

export async function getAllOrganizationsService() {
	return await getAllOrganizations();
}
import { createOrganization } from './organization.repo.js';

export async function createOrganizationService(orgData) {
	return await createOrganization(orgData);
}
