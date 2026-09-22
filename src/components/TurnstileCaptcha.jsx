import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";

export default function TurnstileCaptcha({ onVerify, onError, onExpire, className = "" }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  return (
    <div className={`my-3 flex justify-center ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => onVerify && onVerify(token)}
        onError={(err) => onError && onError(err)}
        onExpire={() => onExpire && onExpire()}
        options={{
          theme: "auto",
        }}
      />
    </div>
  );
}
