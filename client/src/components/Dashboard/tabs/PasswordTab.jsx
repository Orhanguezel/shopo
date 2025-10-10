// src/components/Profile/tabs/PasswordTab.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import PasswordSvg from "./PasswordSvg";

// API (AuthLite)
import { useChangePasswordMutation } from "@/api-manage/api-call-functions/public/publicAuth.api";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ) : (
    <svg
      width="25"
      height="21"
      viewBox="0 0 25 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none"
      aria-hidden="true"
    >
      <path d="M20.5483 16.3524C20.156 15.9557 19.7696 15.5605 19.3802 15.1683C18.7802 14.5653 18.1787 13.9638 17.5728 13.3667C17.4972 13.2911 17.4871 13.2388 17.5379 13.1415C19.3482 9.66037 17.2125 5.46008 13.3332 4.87747C12.1143 4.69441 10.9534 4.89636 9.85791 5.46299C9.78672 5.49931 9.73587 5.53563 9.65596 5.45572C8.88157 4.67262 8.10136 3.89678 7.32261 3.11803C7.30082 3.09624 7.28338 3.07154 7.24561 3.0265C7.5667 2.90591 7.8689 2.78387 8.17837 2.67926C10.0758 2.03563 12.0242 1.83513 14.0132 2.05161C18.879 2.58337 23.1752 5.85381 24.9768 10.3926C25 10.4522 25.0073 10.5379 24.9826 10.596C24.0484 12.8916 22.5955 14.792 20.6282 16.2986C20.6137 16.3117 20.5963 16.3219 20.5483 16.3524Z" fill="#797979" />
      <path d="M4.44163 4.65918C4.91528 5.13573 5.3773 5.6021 5.84222 6.06703C6.36962 6.59442 6.89703 7.12327 7.42733 7.64776C7.49853 7.7175 7.51015 7.7669 7.4622 7.85989C5.81462 11.0228 7.40118 14.873 10.801 15.9336C12.2829 16.3956 13.7271 16.2576 15.1161 15.5573C15.1626 15.534 15.2076 15.5093 15.2468 15.489C16.0735 16.3186 16.893 17.1424 17.724 17.9778C17.6862 17.9952 17.6383 18.0199 17.5874 18.0403C15.5069 18.8844 13.3493 19.1909 11.1162 18.9657C6.18511 18.4674 1.87 15.2275 0.02773 10.6364C0.000124928 10.5666 -0.0114982 10.4693 0.0146539 10.4039C0.941602 8.12286 2.38433 6.23411 4.33557 4.73328C4.36317 4.71003 4.39514 4.69114 4.44163 4.65918Z" fill="#797979" />
      <path d="M2.04297 1.0577C2.36406 0.732254 2.72292 0.370486 3.09051 0C9.71717 6.64695 16.3482 13.2968 22.9749 19.9438C22.645 20.2721 22.2833 20.631 21.9128 21C15.2905 14.3531 8.66237 7.70174 2.04297 1.0577Z" fill="#797979" />
      <path d="M13.5471 13.7324C12.655 14.071 11.1164 14.0158 10.0093 12.8433C9.16664 11.9512 8.80197 10.3283 9.27125 9.46387C10.698 10.8877 12.116 12.3028 13.5471 13.7324Z" fill="#797979" />
      <path d="M11.519 7.24656C12.3123 6.80779 13.9425 7.17247 14.8389 8.01369C16.0172 9.11933 16.071 10.6638 15.7528 11.4933C14.342 10.0797 12.9269 8.66022 11.519 7.24656Z" fill="#797979" />
    </svg>
  );
}
EyeIcon.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default function PasswordTab() {
  // form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // show/hide states
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const getErrMsg = (err) =>
    err?.data?.message || err?.error || err?.message || "Şifre güncellenemedi.";

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Eski ve yeni şifre zorunlu.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Yeni şifre en az 8 karakter olmalı.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifre ile tekrar şifre uyuşmuyor.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("Yeni şifre eski şifreyle aynı olamaz.");
      return;
    }

    try {
      await toast.promise(changePassword({ currentPassword, newPassword }).unwrap(), {
        pending: "Şifre güncelleniyor...",
        success: "Şifre başarıyla güncellendi.",
        error: { render: ({ data }) => getErrMsg(data) },
      });

      // temizle
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  const onCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  return (
    <div className="changePasswordTab w-full">
      <div className="w-full flex xl:flex-row flex-col-reverse space-x-5 xl:items-center">
        <form className="w-[397px] mb-10" onSubmit={onSubmit}>
          {/* current */}
          <div className="input-field mb-6">
            <label className="input-label text-qgray text-sm block mb-2.5" htmlFor="old_password">
              Old Password*
            </label>
            <div className="input-wrapper border border-[#E8E8E8] w-full h-[58px] overflow-hidden relative">
              <input
                placeholder="● ● ● ● ● ●"
                className="input-field placeholder:text-base text-bese px-4 text-dark-gray w-full h-full bg-[#FAFAFA] focus:ring-0 focus:outline-none"
                type={showOld ? "text" : "password"}
                id="old_password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-6 bottom-[17px] z-10 cursor-pointer"
                onClick={() => setShowOld((v) => !v)}
                aria-label="Toggle old password visibility"
                aria-pressed={showOld}
              >
                <EyeIcon visible={showOld} />
              </button>
            </div>
          </div>

          {/* new */}
          <div className="input-field mb-6">
            <label className="input-label text-qgray text-sm block mb-2.5" htmlFor="new_password">
              Password*
            </label>
            <div className="input-wrapper border border-[#E8E8E8] w-full h-[58px] overflow-hidden relative">
              <input
                placeholder="● ● ● ● ● ●"
                className="input-field placeholder:text-base text-bese px-4 text-dark-gray w-full h-full bg-[#FAFAFA] focus:ring-0 focus:outline-none"
                type={showNew ? "text" : "password"}
                id="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-6 bottom-[17px] z-10 cursor-pointer"
                onClick={() => setShowNew((v) => !v)}
                aria-label="Toggle new password visibility"
                aria-pressed={showNew}
              >
                <EyeIcon visible={showNew} />
              </button>
            </div>
          </div>

          {/* confirm */}
          <div className="input-field mb-6">
            <label className="input-label text-qgray text-sm block mb-2.5" htmlFor="confirm_password">
              Re-enter Password*
            </label>
            <div className="input-wrapper border border-[#E8E8E8] w-full h-[58px] overflow-hidden relative">
              <input
                placeholder="● ● ● ● ● ●"
                className="input-field placeholder:text-base text-bese px-4 text-dark-gray w-full h-full bg-[#FAFAFA] focus:ring-0 focus:outline-none"
                type={showConfirm ? "text" : "password"}
                id="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-6 bottom-[17px] z-10 cursor-pointer"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle confirm password visibility"
                aria-pressed={showConfirm}
              >
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
          </div>

          <div className="w-full mt-[30px] flex justify-start">
            <div className="sm:flex sm:space-x-[30px] items-center">
              <div className="w-[180px] h-[50px]">
                <button type="submit" className="yellow-btn disabled:opacity-60" disabled={isLoading}>
                  <div className="w-full text-sm font-semibold">
                    {isLoading ? "Updating..." : "Update Password"}
                  </div>
                </button>
              </div>
              <button type="button" onClick={onCancel}>
                <div className="w-full text-sm font-semibold text-qblack mb-5 sm:mb-0">Cancel</div>
              </button>
            </div>
          </div>
        </form>

        <div className="flex-1 sm:flex hidden justify-end">
          <PasswordSvg />
        </div>
      </div>
    </div>
  );
}
