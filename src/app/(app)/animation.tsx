'use client';

import React, { useState, useEffect } from 'react';

const AnimatedHeading = () => {
  const [currentText, setCurrentText] = useState('delivered');
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const sequence = async () => {
      // Show "delivered" and animate it going up then down
      setCurrentText('delivered');
      setAnimationClass('animate-bounce-up');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnimationClass('animate-bounce-down');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fade out and replace with "at your doorstep"
      setAnimationClass('animate-fade-out');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentText('at your doorstep');
      setAnimationClass('animate-fade-in');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fade out and replace with "for you"
      setAnimationClass('animate-fade-out');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentText('for you');
      setAnimationClass('animate-fade-in');
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const interval = setInterval(sequence, 6000);
    sequence(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx>{`
        .animate-bounce-up {
          animation: bounceUp 0.8s ease-out;
        }
        
        .animate-bounce-down {
          animation: bounceDown 0.8s ease-out;
        }
        
        .animate-fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes bounceUp {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes bounceDown {
          0% { transform: translateY(0px); }
          30% { transform: translateY(-10px); }
          60% { transform: translateY(3px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      
      <h1 className="text-4xl md:text-5xl font-bold text-white shadow-md">
        Anything you need,{' '}
        <span className="inline-block min-w-[200px] md:min-w-[300px] text-left">
          <span 
            className={`
              inline-block transition-colors duration-300
              ${currentText === 'delivered' ? 'text-blue-200' : ''}
              ${currentText === 'at your doorstep' ? 'text-purple-200' : ''}
              ${currentText === 'for you' ? 'text-green-200' : ''}
              
              ${animationClass}
            `}
          >
            {currentText}
          </span>
        </span>
      </h1>
    </>
  );
};

export default AnimatedHeading;