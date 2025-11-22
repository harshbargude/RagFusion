import React from 'react';

function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Gemini RAG App. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;