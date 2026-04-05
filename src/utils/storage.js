const USER_KEY = "tms_user";

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};