// components/Icons.tsx
import React from 'react';

export const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <rect x="5" y="14" width="14" height="7" rx="3.5" fill="currentColor" opacity=".25" />
  </svg>
);

export const ChevronLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
  </svg>
);

export const ChevronRightIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
  </svg>
);

export const WhatsAppIcon = () => (
  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.75 13.96c.25.13.41.2.46.3.05.1.04.53-.12 1.18-.16.65-.53 1.2-1.04 1.51-.52.31-1.13.36-1.73.21-.6-.15-1.46-.54-2.86-1.74-1.64-1.4-2.93-3.15-3.22-3.63-.29-.48-.6-1.03-.6-1.63s.32-1.09.47-1.24c.15-.15.34-.19.49-.19.15 0 .31.01.44.03.13.02.24.04.36.29.12.25.53 1.29.53 1.37s.01.18-.08.31c-.09.13-.2.2-.31.31-.11.11-.21.24-.31.36-.1.11-.2.23-.08.46.12.23.53.94 1.18 1.59.91.91 1.74 1.33 2.01 1.45.27.12.43.1.59-.05.16-.15.68-.78.85-.98.17-.2.34-.15.59-.03zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.43 0 2.8-.3 4.03-.86l4.17 1.38-1.42-4.04c.59-1.25.92-2.64.92-4.08C22 6.48 17.52 2 12 2z"></path>
  </svg>
);

export const DownloadIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
  </svg>
);

export const DatabaseIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

export const SpinnerIcon = () => (
  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4m0 12v4m8.485-8.485l-2.828 2.828M5.757 5.757L2.929 8.585M20 12h-4M8 12H4m13.314-5.314l-2.828 2.828m-8.486 8.486l-2.828-2.828"></path>
  </svg>
);