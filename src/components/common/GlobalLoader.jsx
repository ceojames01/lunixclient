import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const GlobalLoader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px]">
      <div className="w-64 h-64">
        <DotLottieReact
          src="https://lottie.host/583b1469-962f-4620-ad3a-d0cc4995f594/dd748T6Zva.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default GlobalLoader;
