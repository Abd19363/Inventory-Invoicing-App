const USER = {
  email: "admin@gmail.com",
  password: "123456",
};

export async function login(email, password) {
  if (email === USER.email && password === USER.password) {
    localStorage.setItem("isLoggedIn", "true");
    return true;
  }

  throw new Error("Invalid Email or Password");
}

export function logout() {
  localStorage.removeItem("isLoggedIn");
}

export function isAuthenticated() {
  return localStorage.getItem("isLoggedIn") === "true";
}