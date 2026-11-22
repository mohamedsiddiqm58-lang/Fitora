import React from 'react';

export default function RunnerIcon({ className = "w-20 h-20" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Running boy figure matching the reference image */}
      {/* Head & Hair */}
      <circle cx="50" cy="24" r="9" fill="#F8C291" />
      {/* Hair */}
      <path
        d="M42 22C42 17 46 14 53 14C58 14 60 17 60 20C57 19 54 20 52 21C49 20 46 22 42 22Z"
        fill="#4A3525"
      />
      {/* Neck */}
      <rect x="48" y="32" width="4" height="4" fill="#F8C291" />

      {/* Torso / Orange T-Shirt */}
      <path
        d="M44 36C42 36 39 38 41 42L43 54C43 55 45 56 46 56H55C56 56 58 55 58 54L60 42C62 38 59 36 57 36H44Z"
        fill="#FF7A00"
      />
      {/* Left Arm (Pumping back) */}
      <path
        d="M43 38L34 46L31 43"
        stroke="#F8C291"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Arm (Pumping forward) */}
      <path
        d="M57 38L66 43L70 39"
        stroke="#F8C291"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Blue Running Shorts */}
      <path
        d="M45 55L41 68L48 69L50 60L52 69L59 67L55 55H45Z"
        fill="#3B6978"
      />

      {/* Legs */}
      {/* Left Leg (reaching forward) */}
      <path
        d="M44 68L40 79L48 83"
        stroke="#F8C291"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Shoe (Cyan/Blue sports shoe) */}
      <path
        d="M46 83L54 83C56 83 57 85 55 87H44L46 83Z"
        fill="#2980B9"
      />

      {/* Right Leg (trailing backward in stride) */}
      <path
        d="M56 67L68 74L74 72"
        stroke="#F8C291"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Shoe */}
      <path
        d="M73 71L79 73C81 74 81 76 79 77L72 74L73 71Z"
        fill="#2980B9"
      />
    </svg>
  );
}
