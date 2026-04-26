import { createResource, deactivateResource, fetchResources, patchResource } from "../api.js";

const DEFAULT_RESOURCE_CREDENTIALS = {
	username: process.env.REACT_APP_RESOURCE_API_USERNAME || "admin",
	password: process.env.REACT_APP_RESOURCE_API_PASSWORD || "admin123"
};

export function getDefaultResourceCredentials() {
	return DEFAULT_RESOURCE_CREDENTIALS;
}

export function listResources(filters = {}, credentials = DEFAULT_RESOURCE_CREDENTIALS) {
	return fetchResources(credentials, filters);
}

export function createResourceEntry(payload, credentials = DEFAULT_RESOURCE_CREDENTIALS) {
	return createResource(credentials, payload);
}

export function updateResourceEntry(id, payload, credentials = DEFAULT_RESOURCE_CREDENTIALS) {
	return patchResource(credentials, id, payload);
}

export function removeResourceEntry(id, credentials = DEFAULT_RESOURCE_CREDENTIALS) {
	return deactivateResource(credentials, id);
}
