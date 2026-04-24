import * as React from "react";

/**
 * Google brand logo. Lucide does not provide brand logos by design, so this is
 * the Aegis-standard replacement for any "sign in with Google" flow. Do not
 * inline Google SVG elsewhere — always import this component.
 */
export const GoogleIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      fill="#4285F4"
      d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.642h6.458c-.277 1.5-1.12 2.77-2.386 3.622v3.01h3.862c2.262-2.084 3.586-5.152 3.586-8.819Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.956-1.074 7.94-2.908l-3.862-3.01c-1.074.72-2.444 1.146-4.078 1.146-3.13 0-5.78-2.113-6.726-4.95H1.282v3.11A11.998 11.998 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.274 14.278A7.202 7.202 0 0 1 4.895 12c0-.79.137-1.557.38-2.278v-3.11H1.282A11.998 11.998 0 0 0 0 12c0 1.936.463 3.764 1.282 5.388l3.992-3.11Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.772c1.766 0 3.35.608 4.596 1.8l3.425-3.425C17.95 1.19 15.236 0 12 0 7.314 0 3.266 2.69 1.282 6.612l3.992 3.11C6.22 6.885 8.87 4.772 12 4.772Z"
    />
  </svg>
);
