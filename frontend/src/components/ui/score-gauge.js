"use client"

import * as React from "react"
import { motion } from "framer-motion"

export function ScoreGauge({ score, size = 192 }) {
  const radius = size * 0.4
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Vibrant Circular Gauge */}
      <div 
        className="relative rounded-full bg-surface-container flex items-center justify-center shadow-inner"
        style={{ width: size, height: size }}
      >
        {/* Background Track (Simulation of the complex borders in HTML) */}
        <div className="absolute inset-2 rounded-full border-[16px] border-surface-container-lowest border-t-secondary border-r-secondary border-b-secondary border-l-primary rotate-45 opacity-20" />
        
        {/* Dynamic SVG Gauge */}
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          className="rotate-[-90deg] absolute inset-0 z-10"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            className="text-surface-container-lowest"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            className="text-primary"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>

        {/* Center Content */}
        <div className="bg-surface-container-lowest w-[70%] h-[70%] rounded-full flex flex-col items-center justify-center shadow-md z-20">
          <span className="text-4xl font-bold text-on-background leading-none italic">{score}%</span>
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] mt-1">
            {score >= 80 ? "Elite Match" : score >= 60 ? "Strong Fit" : "Needs Voltage"}
          </span>
        </div>
      </div>
    </div>
  )
}
