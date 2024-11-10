export const setToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    const bearerToken = `Bearer ${token}`;
    return bearerToken;
  } else {
    return null;
  }
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
};
