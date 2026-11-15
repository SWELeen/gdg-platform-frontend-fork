// Remove credentials left by versions predating HttpOnly sessions.
export function clearApiSession() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem("gdg_api_session");
}
