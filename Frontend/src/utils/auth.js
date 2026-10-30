// localStorage helpers (same keys the original pages used: "token" and "user")
export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const setAuth = (token, user) => {
  localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearToken = () => localStorage.removeItem("token");

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
