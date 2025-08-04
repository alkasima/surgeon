import type { SVGProps } from 'react';

export const FollicleFlowLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="120"
    height="30"
    aria-labelledby="logoTitle"
    {...props}
  >
    <title id="logoTitle">FollicleFlow Logo</title>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');
        .logo-text {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 28px;
          fill: url(#logoGradient);
        }
        .logo-dot {
          fill: hsl(var(--primary));
        }
      `}
    </style>
    {/* Simple representation of a follicle or flow */}
    <circle className="logo-dot" cx="15" cy="25" r="7" />
    <path d="M 22 25 Q 28 18 34 25" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" />
    <path d="M 22 25 Q 28 32 34 25" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" />
    
    <text x="45" y="32" className="logo-text">
      FollicleFlow
    </text>
  </svg>
);

// You can add more custom icons here if needed
// Example:
// export const MyCustomIcon = (props: SVGProps<SVGSVGElement>) => (