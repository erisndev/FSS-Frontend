import React from "react";

const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div className="w-[50px] h-[50px] rounded-full border-[3px] border-cyan-400/20 border-t-cyan-400 animate-spin" />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
