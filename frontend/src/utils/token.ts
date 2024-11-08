export const setToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  const bearerToken = `Bearer ${token}`;
  return bearerToken;
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
};
