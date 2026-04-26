const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8081"}/api/resources`;

function buildHeaders(credentials) {
  const token = btoa(`${credentials.username}:${credentials.password}`);
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json"
  };
}

export async function fetchResources(credentials, filters) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${API_BASE_URL}?${query.toString()}`, {
    headers: buildHeaders(credentials)
  });

  if (!response.ok) {
    throw new Error(`Failed to load resources (${response.status})`);
  }

  return response.json();
}

export async function createResource(credentials, payload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: buildHeaders(credentials),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create resource" }));
    throw new Error(error.message || "Failed to create resource");
  }

  return response.json();
}

export async function patchResource(credentials, id, payload) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: buildHeaders(credentials),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to update resource" }));
    throw new Error(error.message || "Failed to update resource");
  }

  return response.json();
}

export async function deactivateResource(credentials, id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: buildHeaders(credentials)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to deactivate resource" }));
    throw new Error(error.message || "Failed to deactivate resource");
  }
}
