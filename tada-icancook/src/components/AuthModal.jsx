import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../services/firebase";

function getFriendlyAuthError(error) {
  const code = error?.code || "";

  const errorMessages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-email": "Please enter your email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/popup-closed-by-user": "The sign-in window was closed before completing login.",
    "auth/requires-recent-login": "Please log in again to continue.",
  };

  return errorMessages[code] || "Something went wrong. Please try again.";
}

function AuthModal({ mode, onClose, onSuccess }) {
  const [activeMode, setActiveMode] = useState(mode || "login");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    setActiveMode(mode || "login");
    clearMessage();
  }, [mode]);

  useEffect(() => {
    if (!mode) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mode]);

  if (!mode) return null;

  const isLogin = activeMode === "login";

  function clearMessage() {
    setMessage("");
    setMessageType("error");
  }

  function showMessage(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  async function handleLogin(event) {
    event.preventDefault();
    clearMessage();

    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email || !password) {
      showMessage("Please enter your email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      showMessage("Logged in successfully.", "success");
      onSuccess?.("Logged in successfully.", "success");

      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      showMessage(getFriendlyAuthError(error));
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    clearMessage();

    const email = signupEmail.trim();
    const password = signupPassword;

    if (!email || !password) {
      showMessage("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      showMessage("Password should be at least 6 characters.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      showMessage("Account created successfully.", "success");
      onSuccess?.("Account created successfully.", "success");

      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      showMessage(getFriendlyAuthError(error));
    }
  }

  function handleClose() {
    clearMessage();
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    onClose();
  }

  return (
    <div className="modal" aria-hidden="false">
      <div className="modal-backdrop" onClick={handleClose}></div>

      <div
        className="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="authModalTitle"
      >
        <button
          className="modal-close"
          type="button"
          aria-label="Close"
          onClick={handleClose}
        >
          ✕
        </button>

        <div className="auth-modal-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
              type="button"
              onClick={() => {
                setActiveMode("login");
                clearMessage();
              }}
            >
              Login
            </button>

            <button
              className={`auth-tab ${!isLogin ? "auth-tab--active" : ""}`}
              type="button"
              onClick={() => {
                setActiveMode("signup");
                clearMessage();
              }}
            >
              Sign Up
            </button>
          </div>

          {message && (
            <div
              className={`auth-message ${
                messageType === "success"
                  ? "auth-message--success"
                  : "auth-message--error"
              }`}
            >
              {message}
            </div>
          )}

          {isLogin && (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2 id="authModalTitle" className="auth-title">
                Welcome back
              </h2>

              <p className="auth-subtitle">
                Log in to save and view your favorite recipes.
              </p>

              <label className="auth-label" htmlFor="loginEmail">
                Email
              </label>
              <input
                id="loginEmail"
                className="auth-input"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
                autoFocus
              />

              <label className="auth-label" htmlFor="loginPassword">
                Password
              </label>
              <input
                id="loginPassword"
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />

              <button className="btn btn-primary auth-submit-btn" type="submit">
                Login
              </button>
            </form>
          )}

          {!isLogin && (
            <form className="auth-form" onSubmit={handleSignup}>
              <h2 id="authModalTitle" className="auth-title">
                Create account
              </h2>

              <p className="auth-subtitle">
                Sign up to save recipes and build your favorites list.
              </p>

              <label className="auth-label" htmlFor="signupEmail">
                Email
              </label>
              <input
                id="signupEmail"
                className="auth-input"
                type="email"
                placeholder="Enter your email"
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                required
                autoFocus
              />

              <label className="auth-label" htmlFor="signupPassword">
                Password
              </label>
              <input
                id="signupPassword"
                className="auth-input"
                type="password"
                placeholder="Create a password"
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                required
              />

              <button className="btn btn-primary auth-submit-btn" type="submit">
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;