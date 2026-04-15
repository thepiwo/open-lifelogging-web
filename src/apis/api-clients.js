import Storage from "../utils/storage";

const request = async (url, options = {}) => {
  const response = await fetch(`${Storage.getApiUrl()}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.auth ? { Token: Storage.getToken() } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export default {
  post: (url, data) => request(url, { method: "POST", body: JSON.stringify(data) }),
  getAuth: (url) => request(url, { method: "GET", auth: true }),
  deleteAuth: (url) => request(url, { method: "DELETE", auth: true }),
};
