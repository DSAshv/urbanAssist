import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} UrbanAssist All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;