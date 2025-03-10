"use client";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.error("No token found, redirecting to login...");
    window.location.href = "/admin/login";
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    console.error("Unauthorized, logging out...");
    handleLogout();
  }

  return response.json();
};
