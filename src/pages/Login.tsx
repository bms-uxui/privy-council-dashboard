import { useState } from "react";
import { useNavigate } from "react-router";
import { providers } from "../data/mockData";
import loginBg from "../assets/login-bg.png";
import loginIllustration from "../assets/login-illustration.png";
import providerIdLogo from "../assets/provider-id-logo.png";
import geoPattern from "../assets/geo-pattern.png";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    setLoading(true);
    // Simulate Provider ID SSO — uses the first online provider as the authenticated unit
    setTimeout(() => {
      const provider = providers.find((p) => p.status !== "offline") || providers[0];
      localStorage.setItem("auth_token", "demo-" + Date.now());
      localStorage.setItem("auth_user", provider.name);
      localStorage.setItem("auth_provider_id", provider.id);
      navigate("/gis", { replace: true });
    }, 600);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background — teal gradient */}
      <img
        src={loginBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Geo pattern — full cover with faded edges */}
      <img
        src={geoPattern}
        alt=""
        className="login-pattern-in absolute inset-0 w-full h-full object-cover pointer-events-none hidden md:block"
        style={{
          ["--target-opacity" as string]: 0.5,
          filter: "brightness(0) invert(1)",
          maskImage:
            "radial-gradient(ellipse closest-side at center, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse closest-side at center, black 20%, transparent 100%)",
        }}
      />

      {/* Doctor illustration — centered, smaller */}
      <img
        src={loginIllustration}
        alt=""
        className="login-image-in absolute left-[38%] -translate-x-1/2 bottom-[-80px] w-auto h-[70vh] max-h-[700px] object-contain object-bottom pointer-events-none hidden md:block"
      />
      {/* Mobile illustration — offset at bottom */}
      <img
        src={loginIllustration}
        alt=""
        className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-[min(480px,110%)] h-auto object-contain pointer-events-none md:hidden opacity-90"
      />

      {/* Form container — glass card */}
      <div className="relative min-h-screen flex items-center justify-center md:justify-end md:pr-[5%] lg:pr-[8.6%] px-4 py-8">
        <div
          className="login-card-in relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 sm:p-10 pb-14 w-full max-w-[544px] border border-white/80"
          style={{
            boxShadow: [
              "0 50px 100px -20px rgba(28, 133, 173, 0.45)",
              "0 30px 60px -15px rgba(28, 133, 173, 0.35)",
              "0 18px 36px -10px rgba(0, 0, 0, 0.22)",
              "0 8px 16px -4px rgba(0, 0, 0, 0.12)",
              "inset 0 2px 0 rgba(255, 255, 255, 1)",
              "inset 0 -3px 0 rgba(0, 0, 0, 0.05)",
              "inset 2px 0 0 rgba(255, 255, 255, 0.6)",
              "inset -2px 0 0 rgba(0, 0, 0, 0.03)",
            ].join(", "),
          }}
        >
          {/* Title */}
          <div className="login-stagger-1 mb-6">
            <h1 className="text-3xl font-bold text-text mb-1">
              ยินดีต้อนรับ
            </h1>
            <p className="text-text-muted text-sm">
              ระบบบริหารจัดการสุขภาพชุมชน ต.ขุนน่าน อ.เฉลิมพระเกียรติ จ.น่าน
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {/* Submit — Sign in with Provider ID */}
          <label className="login-stagger-2 text-xs font-semibold text-text-muted mb-1.5 block text-center">
            เข้าสู่ระบบด้วย
          </label>
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="btn-shimmer login-stagger-3 w-full flex items-center justify-center py-4 mb-6 rounded-full bg-gradient-to-b from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-gray-200"
            style={{
              boxShadow:
                "0 10px 20px -5px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -2px 0 rgba(0, 0, 0, 0.04)",
            }}
          >
            {loading ? (
              <span className="text-sm text-text-muted">กำลังเข้าสู่ระบบ...</span>
            ) : (
              <img src={providerIdLogo} alt="Provider ID" className="h-10 w-auto" />
            )}
          </button>

          <p className="absolute bottom-4 left-0 right-0 text-[11px] text-text-muted text-center">
            Bangkok Medical Software Co., Ltd.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="hidden md:block absolute bottom-4 left-0 right-0 text-center text-xs text-white/70 pointer-events-none">
        © 2569 กระทรวงสาธารณสุข · ต.ขุนน่าน อ.เฉลิมพระเกียรติ จ.น่าน
      </p>
    </div>
  );
}
