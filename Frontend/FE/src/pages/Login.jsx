import React, { useState } from "react";
import "./Login.css";
import userAPI from "../services/userAPI";

const Login = ({ onLogin }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = await userAPI.login(phone, password);
      if (result?.token) {
        localStorage.setItem("token", result.token);
      }
      onLogin?.(result.user);
    } catch (err) {
      const message = err?.message || "";
      if (message === "FIRST_LOGIN_OTP_REQUIRED") {
        openForgot("request");
        setForgotMessage(
          "Tài khoản mới cần xác minh email và đổi mật khẩu trước khi sử dụng."
        );
        setError("");
        return;
      }
      if (message === "FIRST_LOGIN_EMAIL_REQUIRED") {
        setError(
          "Tài khoản chưa có email để xác minh. Vui lòng liên hệ quản trị viên."
        );
        return;
      }
      setError("Đăng nhập thất bại. Vui lòng kiểm tra thông tin.");
    }
  };

  const openForgot = (step = "request") => {
    setForgotOpen(true);
    setForgotStep(step);
    setForgotEmail("");
    setForgotOtp("");
    setForgotPassword("");
    setForgotConfirm("");
    setForgotError("");
    setForgotMessage("");
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotError("");
    setForgotMessage("");
  };

  const handleSendOtp = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Vui lòng nhập email.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      await userAPI.forgotPassword(forgotEmail.trim());
      setForgotStep("verify");
      setForgotMessage("Đã gửi OTP tới email. Vui lòng kiểm tra hộp thư.");
    } catch (err) {
      setForgotError("Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp.trim()) {
      setForgotError("Vui lòng nhập mã OTP.");
      return;
    }

    if (!forgotPassword || !forgotConfirm) {
      setForgotError("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (forgotPassword !== forgotConfirm) {
      setForgotError("Mật khẩu mới không khớp.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      const result = await userAPI.resetPassword(
        forgotEmail.trim(),
        forgotOtp.trim(),
        forgotPassword
      );
      if (result?.token) {
        localStorage.setItem("token", result.token);
        onLogin?.(result.user);
        closeForgot();
        return;
      }
      setForgotMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
      setForgotStep("request");
      setForgotOtp("");
      setForgotPassword("");
      setForgotConfirm("");
    } catch (err) {
      setForgotError("OTP không đúng hoặc đã hết hạn.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-background" />
      <div className="login-overlay" />
      <div className="login-content">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-icon-circle" aria-hidden="true">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7.5C3 6.12 4.12 5 5.5 5h7c1.38 0 2.5 1.12 2.5 2.5V15H7.5C5.57 15 4 16.57 4 18.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M15 9h3.3c.46 0 .9.2 1.2.55l1.7 2.05c.52.62.8 1.4.8 2.2V15h-3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="7"
                  cy="18"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="19"
                  cy="18"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <h1 className="login-title">Hệ Thống Quản Lý Đội Xe</h1>
            <p className="login-subtitle">Fleet Management System</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label" htmlFor="phone">
              Số điện thoại
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M5 19a7 7 0 0 1 14 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                id="phone"
                type="text"
                className="login-input"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <label className="login-label" htmlFor="password">
              Mật khẩu
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 10V8a5 5 0 1 1 10 0v2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" className="login-submit">
              Đăng nhập
            </button>

            <button type="button" className="login-forgot" onClick={() => openForgot("request")}>
              Quên mật khẩu?
            </button>

            
          </form>
        </div>
      </div>

      {forgotOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <h2>Quên mật khẩu</h2>
              <button
                type="button"
                className="login-modal-close"
                onClick={closeForgot}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="login-modal-body">
              {forgotStep === "request" ? (
                <>
                  <p className="login-modal-text">
                    Nhập email tài khoản để nhận mã OTP.
                  </p>
                  <div className="login-input-wrapper">
                    <input
                      type="email"
                      className="login-input"
                      placeholder="Email"
                      value={forgotEmail}
                      onChange={(event) => setForgotEmail(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="login-submit"
                    onClick={handleSendOtp}
                    disabled={forgotLoading}
                  >
                    Gửi OTP
                  </button>
                </>
              ) : (
                <>
                  <p className="login-modal-text">
                    Nhập OTP và mật khẩu mới để hoàn tất.
                  </p>
                  <div className="login-input-wrapper">
                    <input
                      type="text"
                      className="login-input"
                      placeholder="Mã OTP"
                      value={forgotOtp}
                      onChange={(event) => setForgotOtp(event.target.value)}
                    />
                  </div>
                  <div className="login-input-wrapper">
                    <input
                      type="password"
                      className="login-input"
                      placeholder="Mật khẩu mới"
                      value={forgotPassword}
                      onChange={(event) => setForgotPassword(event.target.value)}
                    />
                  </div>
                  <div className="login-input-wrapper">
                    <input
                      type="password"
                      className="login-input"
                      placeholder="Xác nhận mật khẩu mới"
                      value={forgotConfirm}
                      onChange={(event) => setForgotConfirm(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="login-submit"
                    onClick={handleResetPassword}
                    disabled={forgotLoading}
                  >
                    Đổi mật khẩu
                  </button>
                </>
              )}

              {forgotError ? (
                <p className="login-error login-modal-error">{forgotError}</p>
              ) : null}
              {forgotMessage ? (
                <p className="login-modal-success">{forgotMessage}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
