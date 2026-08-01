const USER_KEY = "spark_user_gender";
const PREFER_KEY = "spark_prefer_gender";

export function getUserGender() {
  return sessionStorage.getItem(USER_KEY);
}

export function setUserGender(gender) {
  sessionStorage.setItem(USER_KEY, gender);
}

export function getPreferGender() {
  return sessionStorage.getItem(PREFER_KEY);
}

export function setPreferGender(gender) {
  sessionStorage.setItem(PREFER_KEY, gender);
}

export function clearFlirtSession() {
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(PREFER_KEY);
}
