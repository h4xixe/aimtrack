
import React, { useEffect, useState } from "react";

interface QRCodeProps {
  price: number;
}

const QRCodePlaceholder: React.FC<QRCodeProps> = ({ price }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timeout);
  }, [price]);

  return (
    <div className={`w-48 h-48 bg-white rounded-lg p-3 transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
      <div className="w-full h-full relative flex flex-col items-center justify-center">
        {/* QR Code Grid */}
        <div className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full absolute">
          {/* Corner Squares - Top Left */}
          <div className="col-span-1 row-span-1 bg-black rounded-tl-lg"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-transparent"></div>
          <div className="col-span-1 row-span-1 bg-transparent"></div>
          <div className="col-span-1 row-span-1 bg-transparent"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-black rounded-tr-lg"></div>

          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-white"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-white"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          
          {/* Random QR code pattern - rows 3-5 */}
          {Array.from({ length: 3 * 7 }).map((_, index) => (
            <div 
              key={index} 
              className={`col-span-1 row-span-1 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
            ></div>
          ))}
          
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-white"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-white"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-white"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>

          {/* Corner Squares - Bottom Left */}
          <div className="col-span-1 row-span-1 bg-black rounded-bl-lg"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-transparent"></div>
          <div className="col-span-1 row-span-1 bg-transparent"></div>
          <div className="col-span-1 row-span-1 bg-transparent"></div>
          <div className="col-span-1 row-span-1 bg-black"></div>
          <div className="col-span-1 row-span-1 bg-black rounded-br-lg"></div>
        </div>
        
        {/* Central logo */}
        <div className="z-10 bg-white/90 backdrop-blur-sm p-1 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center text-white font-bold text-sm">
            WYZ
          </div>
        </div>
        
        {/* Price */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-primary/90 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
          R$ {price},00
        </div>
      </div>
    </div>
  );
};

export default QRCodePlaceholder;
