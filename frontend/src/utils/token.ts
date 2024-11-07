export const setToken = (token: string) => {
  const bearerToken = `Bearer ${token}`;
  localStorage.setItem("accessToken", bearerToken);
};

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token;
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
};
