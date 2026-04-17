import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PreplyPulse — Stop chasing trials. Start reading your numbers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDF2F8 0%, #FFFFFF 50%, #FDF2F8 100%)",
        }}
      >
        <svg
          width="280"
          height="280"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="#F472B6" />
          <polyline
            points="4,18 10,18 13,8 16,24 19,14 22,18 28,18"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
