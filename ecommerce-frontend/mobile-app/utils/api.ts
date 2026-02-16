import { getToken } from "@/utils/authStorage";

const API_URL = "http://localhost:5000"; // web
// use IP when testing on phone

export const authFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = await getToken();

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};

console.log("TOKEN:", await getToken());
