import React from "react";

const LoadingSpinner = ({
  variant = "page",
  size,
  text,
  className = "",
  color = "cyan",
}) => {
  // Resolve size from variant if not explicitly set
  const resolvedSize =
    size || { page: "lg", section: "md", inline: "sm" }[variant] || "md";

  const sizeMap = {
    sm: { wrapper: "w-4 h-4", border: "border-2", inner: null },
    md: { wrapper: "w-8 h-8", border: "border-[3px]", inner: null },
    lg: { wrapper: "w-14 h-14", border: "border-[3px]", inner: true },
  };

  const s = sizeMap[resolvedSize] || sizeMap.md;

  const borderColor =
    color === "white"
      ? "border-white border-t-transparent"
      : "border-cyan-400 border-t-transparent";

  const borderColorReverse =
    color === "white"
      ? "border-white/40 border-b-transparent"
      : "border-purple-400 border-b-transparent";

  // Simple single-ring spinner for sm / md
  if (resolvedSize === "sm") {
    return (
      <div
        className={`${s.wrapper} ${s.border} ${borderColor} rounded-full motion-safe:animate-spin
 ${className}`}
      />
    );
  }

  // Dual-ring spinner
  const rings = (
    <div className={`relative ${s.wrapper}`}>
      <div
        className={`absolute inset-0 rounded-full ${s.border} border-transparent border-t-cyan-400 motion-safe:animate-spin
`}
        style={color === "white" ? { borderTopColor: "white" } : undefined}
      />
      <div
        className={`absolute inset-1 rounded-full ${s.border} border-transparent border-b-purple-400 motion-safe:animate-spin
`}
        style={{
          animationDirection: "reverse",
          animationDuration: "1.5s",
          ...(color === "white"
            ? { borderBottomColor: "rgba(255,255,255,0.4)" }
            : {}),
        }}
      />
      {s.inner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );

  const label =
    text !== undefined ? text : variant !== "inline" ? "Loading…" : null;

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {rings}
      {label && (
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (variant === "page") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  if (variant === "section") {
    return (
      <div className="flex items-center justify-center py-16">{content}</div>
    );
  }

  // inline
  return content;
};

export default LoadingSpinner;
