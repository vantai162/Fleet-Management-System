import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard } from "react-icons/fa";
import userAPI from "../services/userAPI";
import driverAPI from "../services/driverAPI";
import "./Account.css";

const normalizeRole = (role) => (role || "").toLowerCase();

const formatRoleLabel = (role) => {
  const normalized = normalizeRole(role);
  const roleMap = {
    admin: "Quản trị viên",
    staff: "Nhân viên",
    driver: "Tài xế",
  };
  return roleMap[normalized] || role || "Nhân viên";
};

const formatDateInput = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  try {
    const date = new Date(dateValue);
    return date.toLocaleDateString("vi-VN");
  } catch {
    return String(dateValue);
  }
};

const computeAge = (birthDate) => {
  if (!birthDate) return "";
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Date().getFullYear() - date.getFullYear();
};

const resolveDriverId = (user) =>
  user?.driverId ??
  user?.driverID ??
  user?.DriverID ??
  user?.driver?.driverId ??
  user?.driver?.driverID ??
  user?.driver?.DriverID ??
  user?.driverInfo?.driverId ??
  user?.driverInfo?.driverID ??
  user?.driverProfile?.driverId ??
  user?.driverProfile?.driverID ??
  null;

const getDriverGplx = (user, driverInfo) =>
  driverInfo?.gplx ??
  driverInfo?.GPLX ??
  driverInfo?.driver?.gplx ??
  user?.gplx ??
  user?.GPLX ??
  user?.driver?.gplx ??
  user?.driver?.GPLX ??
  user?.driverProfile?.gplx ??
  user?.driverInfo?.gplx ??
  "";

const getDriverExpiry = (user, driverInfo) =>
  driverInfo?.licenseExpiry ??
  driverInfo?.LicenseExpiry ??
  driverInfo?.licenses?.[0]?.expiryDate ??
  driverInfo?.licenses?.[0]?.ExpiryDate ??
  driverInfo?.Licenses?.[0]?.expiryDate ??
  driverInfo?.Licenses?.[0]?.ExpiryDate ??
  user?.licenseExpiry ??
  user?.LicenseExpiry ??
  user?.driverLicense?.expiryDate ??
  user?.driverLicense?.ExpiryDate ??
  user?.driver?.licenseExpiry ??
  user?.driver?.expiryDate ??
  user?.driverLicenses?.[0]?.expiryDate ??
  user?.driverLicenses?.[0]?.ExpiryDate ??
  "";

const Account = ({ currentUser, onUpdateUser }) => {
  const [profile, setProfile] = useState({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    birthPlace: "",
    birthDate: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarState, setAvatarState] = useState({
    isUploading: false,
    isDeleting: false,
    error: "",
  });

  const [driverInfo, setDriverInfo] = useState(null);
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [otpState, setOtpState] = useState({
    pendingEmail: "",
    code: "",
    isOpen: false,
    error: "",
    purpose: "",
  });
  const [saveState, setSaveState] = useState({
    isSaving: false,
    error: "",
    success: "",
  });
  const [passwordState, setPasswordState] = useState({
    isSaving: false,
    error: "",
    success: "",
  });
  const [pendingPassword, setPendingPassword] = useState("");

  const updateProfile = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const updatePassword = (field, value) =>
    setPassword((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setProfile({
      fullName: currentUser.fullName || currentUser.FullName || currentUser.username || "",
      gender: currentUser.gender || currentUser.Gender || "",
      email: currentUser.email || currentUser.Email || "",
      phone: currentUser.phone || currentUser.Phone || "",
      role: currentUser.role || currentUser.Role || "",
      department: currentUser.department || currentUser.Department || "",
      birthPlace: currentUser.birthPlace || currentUser.BirthPlace || "",
      birthDate: formatDateInput(currentUser.birthDate || currentUser.BirthDate || ""),
    });
    setAvatarUrl(currentUser.avatar || currentUser.Avatar || "");
  }, [currentUser]);

  useEffect(() => {
    const loadDriverInfo = async () => {
      const role = normalizeRole(currentUser?.role || currentUser?.Role);
      if (role !== "driver") {
        setDriverInfo(null);
        return;
      }

      try {
        let driverId = resolveDriverId(currentUser);

        if (!driverId) {
          const keyword =
            currentUser?.phone ||
            currentUser?.Phone ||
            currentUser?.email ||
            currentUser?.Email ||
            currentUser?.fullName ||
            currentUser?.FullName ||
            "";
          if (keyword) {
            const listResponse = await driverAPI.getAllDrivers({
              pageNumber: 1,
              pageSize: 10,
              keyword,
            });
            const list =
              listResponse?.objects ||
              listResponse?.items ||
              listResponse ||
              [];
            const normalizedKeyword = keyword.toString().trim().toLowerCase();
            const matched = Array.isArray(list)
              ? list.find((driver) => {
                  const phone =
                    driver?.phone || driver?.Phone || driver?.userPhone || "";
                  const email =
                    driver?.email || driver?.Email || driver?.userEmail || "";
                  const name =
                    driver?.fullName || driver?.FullName || driver?.userName || "";
                  return (
                    phone?.toString().trim() === normalizedKeyword ||
                    email?.toString().trim().toLowerCase() ===
                      normalizedKeyword ||
                    name?.toString().trim().toLowerCase() === normalizedKeyword
                  );
                })
              : null;
            driverId =
              matched?.driverID ??
              matched?.DriverID ??
              matched?.driverId ??
              matched?.DriverId ??
              null;
          }
        }

        if (!driverId) {
          setDriverInfo(null);
          return;
        }

        const data = await driverAPI.getDriverDetails(driverId);
        setDriverInfo(data);
      } catch (error) {
        console.error("Error loading driver details:", error);
        setDriverInfo(null);
      }
    };

    loadDriverInfo();
  }, [currentUser]);

  const syncProfileFromUser = (user) => {
    if (!user) {
      return;
    }

    setProfile((prev) => ({
      ...prev,
      fullName: user.fullName ?? user.FullName ?? prev.fullName,
      email: user.email ?? user.Email ?? prev.email,
      phone: user.phone ?? user.Phone ?? prev.phone,
      role: user.role ?? user.Role ?? prev.role,
      department: user.department ?? user.Department ?? prev.department,
      gender: user.gender ?? user.Gender ?? prev.gender,
      birthPlace: user.birthPlace ?? user.BirthPlace ?? prev.birthPlace,
      birthDate: formatDateInput(
        user.birthDate ?? user.BirthDate ?? prev.birthDate
      ),
    }));
  };

  const handleSaveProfile = async () => {
    if (!onUpdateUser) {
      return;
    }

    const nextEmail = profile.email?.trim() || "";
    const currentEmail = currentUser?.email?.trim() || currentUser?.Email?.trim() || "";

    if (nextEmail && nextEmail !== currentEmail) {
      setSaveState({ isSaving: true, error: "", success: "" });
      try {
        await userAPI.sendOtp(nextEmail, "email-change");
        setOtpState({
          pendingEmail: nextEmail,
          code: "",
          isOpen: true,
          error: "",
          purpose: "email-change",
        });
        setSaveState({ isSaving: false, error: "", success: "" });
      } catch (error) {
        setSaveState({
          isSaving: false,
          error: error?.message || "Không thể gửi OTP.",
          success: "",
        });
      }
      return;
    }

    setSaveState({ isSaving: true, error: "", success: "" });
    try {
      const updatedUser = await onUpdateUser({ ...profile });
      syncProfileFromUser(updatedUser);
      setSaveState({
        isSaving: false,
        error: "",
        success: "Đã lưu thay đổi.",
      });
    } catch (error) {
      setSaveState({
        isSaving: false,
        error: error?.message || "Lưu thay đổi thất bại.",
        success: "",
      });
    }
  };

  const resolveUserId = (user) =>
    user?.userID ?? user?.UserID ?? user?.id ?? user?.userId ?? null;

  const handleAvatarUpload = async (file) => {
    if (!file || !currentUser) {
      return;
    }

    const userId = resolveUserId(currentUser);
    if (!userId) {
      setAvatarState((prev) => ({
        ...prev,
        error: "Không tìm thấy userId.",
      }));
      return;
    }

    setAvatarState({ isUploading: true, isDeleting: false, error: "" });
    try {
      const result = await userAPI.uploadAvatar(userId, file);
      const nextAvatar =
        result?.avatarUrl || result?.AvatarUrl || result?.avatar || "";
      if (nextAvatar) {
        setAvatarUrl(nextAvatar);
      }

      if (onUpdateUser) {
        await onUpdateUser({ avatar: nextAvatar });
      }
    } catch (error) {
      setAvatarState({
        isUploading: false,
        isDeleting: false,
        error: error?.message || "Không thể upload ảnh.",
      });
      return;
    }

    setAvatarState({ isUploading: false, isDeleting: false, error: "" });
  };

  const handleAvatarDelete = async () => {
    if (!currentUser) {
      return;
    }

    const userId = resolveUserId(currentUser);
    if (!userId) {
      setAvatarState((prev) => ({
        ...prev,
        error: "Không tìm thấy userId.",
      }));
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện?")) {
      return;
    }

    setAvatarState({ isUploading: false, isDeleting: true, error: "" });
    try {
      await userAPI.deleteAvatar(userId);
      setAvatarUrl("");
      if (onUpdateUser) {
        await onUpdateUser({});
      }
      setAvatarState({ isUploading: false, isDeleting: false, error: "" });
    } catch (error) {
      setAvatarState({
        isUploading: false,
        isDeleting: false,
        error: error?.message || "Không thể xóa ảnh.",
      });
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedOtp = otpState.code.trim();
    if (!trimmedOtp) {
      setOtpState((prev) => ({ ...prev, error: "Vui lòng nhập mã OTP." }));
      return;
    }

    try {
      await userAPI.verifyOtp(
        otpState.pendingEmail,
        trimmedOtp,
        otpState.purpose
      );

      if (otpState.purpose === "email-change") {
        if (!onUpdateUser) {
          return;
        }

        setSaveState({ isSaving: true, error: "", success: "" });
        const updatedUser = await onUpdateUser({
          ...profile,
          email: otpState.pendingEmail,
        });
        syncProfileFromUser(updatedUser);
        setSaveState({
          isSaving: false,
          error: "",
          success: "Đã cập nhật email.",
        });
      }

      if (otpState.purpose === "password") {
        if (!pendingPassword) {
          setOtpState((prev) => ({
            ...prev,
            error: "Vui lòng nhập mật khẩu mới.",
          }));
          return;
        }

        setPasswordState({ isSaving: true, error: "", success: "" });
        await userAPI.changePassword(otpState.pendingEmail, pendingPassword);
        setPasswordState({
          isSaving: false,
          error: "",
          success: "Đã đổi mật khẩu.",
        });
        setPassword({ current: "", next: "", confirm: "" });
        setPendingPassword("");
      }

      setOtpState({
        pendingEmail: "",
        code: "",
        isOpen: false,
        error: "",
        purpose: "",
      });
    } catch (error) {
      const message = error?.message || "Xác nhận OTP thất bại.";
      setOtpState((prev) => ({ ...prev, error: message }));
      if (otpState.purpose === "email-change") {
        setSaveState({ isSaving: false, error: message, success: "" });
      }
      if (otpState.purpose === "password") {
        setPasswordState({ isSaving: false, error: message, success: "" });
      }
    }
  };

  const handleCancelOtp = () => {
    if (otpState.purpose === "email-change") {
      setProfile((prev) => ({
        ...prev,
        email: currentUser?.email || currentUser?.Email || "",
      }));
    }

    setOtpState({
      pendingEmail: "",
      code: "",
      isOpen: false,
      error: "",
      purpose: "",
    });
  };

  const handleChangePassword = async () => {
    setPasswordState({ isSaving: false, error: "", success: "" });

    if (!currentUser?.email && !currentUser?.Email) {
      setPasswordState({
        isSaving: false,
        error: "Vui lòng cập nhật email trước khi đổi mật khẩu.",
        success: "",
      });
      return;
    }

    if (!password.current || !password.next || !password.confirm) {
      setPasswordState({
        isSaving: false,
        error: "Vui lòng nhập đầy đủ thông tin mật khẩu.",
        success: "",
      });
      return;
    }

    if (password.next !== password.confirm) {
      setPasswordState({
        isSaving: false,
        error: "Mật khẩu mới không khớp.",
        success: "",
      });
      return;
    }

    if (password.current === password.next) {
      setPasswordState({
        isSaving: false,
        error: "Mật khẩu mới phải khác mật khẩu hiện tại.",
        success: "",
      });
      return;
    }

    setPasswordState({ isSaving: true, error: "", success: "" });
    try {
      const currentEmail = currentUser.email || currentUser.Email;
      await userAPI.sendOtp(currentEmail, "password");
      setPendingPassword(password.next);
      setOtpState({
        pendingEmail: currentEmail,
        code: "",
        isOpen: true,
        error: "",
        purpose: "password",
      });
      setPasswordState({ isSaving: false, error: "", success: "" });
    } catch (error) {
      setPasswordState({
        isSaving: false,
        error: error?.message || "Không thể gửi OTP.",
        success: "",
      });
    }
  };

  const otpSubtitle =
    otpState.purpose === "password"
      ? `Mã OTP đã được gửi tới email ${otpState.pendingEmail}. Nhập mã để đổi mật khẩu.`
      : "Mã OTP đã được gửi tới email mới. Nhập OTP để lưu thay đổi.";

  const roleLabel = formatRoleLabel(profile.role);
  const isDriver = normalizeRole(profile.role) === "driver";
  const gplx = getDriverGplx(currentUser, driverInfo);
  const expiry = formatDate(getDriverExpiry(currentUser, driverInfo));
  const age = computeAge(profile.birthDate);

  return (
    <div className="account-container">
      <h2 className="account-title">Quản lý tài khoản</h2>
      <p className="account-subtitle">Cập nhật thông tin cá nhân và cài đặt</p>

      <div className="account-grid">
        <div className="account-card">
          <h3>Ảnh đại diện</h3>

          <div className="avatar-box">
            <div className="avatar-circle">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="avatar-img"
                />
              ) : (
                <img
                  src="/default_avt.jpg"
                  alt="Default Avatar"
                  className="avatar-img"
                />
              )}
            </div>

            <div className="avatar-actions">
              <label
                className={`upload-btn${
                  avatarState.isUploading ? " is-loading" : ""
                }`}
              >
                <span>
                  {avatarState.isUploading ? "Đang tải..." : "Thay đổi ảnh"}
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(event) => {
                    const [file] = event.target.files || [];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                    event.target.value = "";
                  }}
                  disabled={avatarState.isUploading || avatarState.isDeleting}
                />
              </label>
              <button
                type="button"
                className="avatar-delete"
                onClick={handleAvatarDelete}
                disabled={
                  avatarState.isUploading ||
                  avatarState.isDeleting ||
                  !avatarUrl
                }
              >
                {avatarState.isDeleting ? "Đang xóa..." : "Xóa ảnh"}
              </button>
            </div>

            <p className="avatar-note">JPG, PNG tối đa 2MB</p>
            {avatarState.error && (
              <p className="avatar-error">{avatarState.error}</p>
            )}
          </div>

          <hr className="divider" />

          <div className="info-block">
            <h4>Thông tin tài khoản</h4>
            <p>
              ID:{" "}
              <strong>
                #
                {currentUser?.id ??
                  currentUser?.userID ??
                  currentUser?.UserID ??
                  "USER-001"}
              </strong>
            </p>
            <p>
              Ngày tạo: <strong>15/01/2024</strong>
            </p>
            <p>
              Lần đăng nhập cuối: <strong>01/12/2024</strong>
            </p>
          </div>
        </div>

        <div className="account-card">
          <h3>Thông tin cá nhân</h3>

          <div className="form-grid">
            <label>
              Họ và tên
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={profile.fullName}
                  onChange={(e) => updateProfile("fullName", e.target.value)}
                />
              </div>
            </label>

            <label>
              Email
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                />
              </div>
            </label>

            <label>
              Số điện thoại
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                />
              </div>
            </label>

            <label>
              Tuổi
              <div className="input-wrapper is-readonly">
                <input type="text" placeholder="Tuổi" value={age} readOnly />
              </div>
            </label>

            <label>
              Ngày sinh
              <div className="input-wrapper">
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => updateProfile("birthDate", e.target.value)}
                />
              </div>
            </label>

            <label>
              Nơi sinh
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="TP. Hồ Chí Minh"
                  value={profile.birthPlace}
                  onChange={(e) => updateProfile("birthPlace", e.target.value)}
                />
              </div>
            </label>

            <label>
              Giới tính
              <div className="gender-group">
                <button
                  type="button"
                  className={`gender-pill${
                    profile.gender === "male" ? " is-active" : ""
                  }`}
                  onClick={() => updateProfile("gender", "male")}
                >
                  Nam
                </button>
                <button
                  type="button"
                  className={`gender-pill${
                    profile.gender === "female" ? " is-active" : ""
                  }`}
                  onClick={() => updateProfile("gender", "female")}
                >
                  Nữ
                </button>
                <button
                  type="button"
                  className={`gender-pill${
                    profile.gender === "other" ? " is-active" : ""
                  }`}
                  onClick={() => updateProfile("gender", "other")}
                >
                  Khác
                </button>
              </div>
            </label>

            <label>
              Chức vụ
              <div className="input-wrapper is-readonly">
                <input type="text" value={roleLabel} readOnly />
              </div>
            </label>

            <label className="full-width">
              Phòng ban
              <div className="input-wrapper is-readonly">
                <input
                  type="text"
                  value={profile.department || "Chưa cập nhật"}
                  readOnly
                />
              </div>
            </label>

            {isDriver && (
              <>
                <label>
                  Số GPLX
                  <div className="input-wrapper is-readonly">
                    <FaIdCard className="input-icon" />
                    <input
                      type="text"
                      value={gplx || "Chưa cập nhật"}
                      readOnly
                    />
                  </div>
                </label>
                <label>
                  Ngày hết hạn
                  <div className="input-wrapper is-readonly">
                    <input
                      type="text"
                      value={expiry || "Chưa cập nhật"}
                      readOnly
                    />
                  </div>
                </label>
              </>
            )}
          </div>

          <button
            className="save-btn"
            type="button"
            onClick={handleSaveProfile}
            disabled={saveState.isSaving}
          >
            Lưu thay đổi
          </button>
          {saveState.error && (
            <p className="account-save-error">{saveState.error}</p>
          )}
          {saveState.success && (
            <p className="account-save-success">{saveState.success}</p>
          )}
        </div>

        <div className="account-card full-width">
          <h3>Đổi mật khẩu</h3>

          <div className="form-grid">
            <label>
              Mật khẩu hiện tại
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  value={password.current}
                  onChange={(e) => updatePassword("current", e.target.value)}
                />
              </div>
            </label>

            <label>
              Mật khẩu mới
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={password.next}
                  onChange={(e) => updatePassword("next", e.target.value)}
                />
              </div>
            </label>

            <label className="full-width">
              Xác nhận mật khẩu mới
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={password.confirm}
                  onChange={(e) => updatePassword("confirm", e.target.value)}
                />
              </div>
            </label>
          </div>

          <button
            className="save-btn"
            type="button"
            onClick={handleChangePassword}
            disabled={passwordState.isSaving}
          >
            Đổi mật khẩu
          </button>
          {passwordState.error && (
            <p className="account-save-error">{passwordState.error}</p>
          )}
          {passwordState.success && (
            <p className="account-save-success">{passwordState.success}</p>
          )}
        </div>
      </div>

      {otpState.isOpen && (
        <div className="account-otp-overlay">
          <div className="account-otp-card">
            <h3>Xác nhận OTP</h3>
            <p className="account-otp-subtitle">{otpSubtitle}</p>
            <div className="input-wrapper">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Nhập mã OTP"
                value={otpState.code}
                onChange={(e) =>
                  setOtpState((prev) => ({
                    ...prev,
                    code: e.target.value,
                    error: "",
                  }))
                }
              />
            </div>
            {otpState.error && (
              <p className="account-otp-error">{otpState.error}</p>
            )}
            <div className="account-otp-actions">
              <button
                className="account-otp-cancel"
                type="button"
                onClick={handleCancelOtp}
              >
                Hủy
              </button>
              <button
                className="account-otp-confirm"
                type="button"
                onClick={handleVerifyOtp}
                disabled={saveState.isSaving || passwordState.isSaving}
              >
                Xác nhận
              </button>
            </div>
            <p className="account-otp-hint">Mã OTP có hiệu lực trong 10 phút.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
