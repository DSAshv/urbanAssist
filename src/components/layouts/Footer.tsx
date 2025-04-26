import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Community Complaints Portal. All rights reserved.
          </p>
          <div className="mt-2 md:mt-0">
            <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 mx-2">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 mx-2">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;