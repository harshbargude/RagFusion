import React, { useState } from "react";
import { clsx } from "clsx";
import { DocumentUpload } from "../components/DocumentUpload";

export const Profile: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would encrypt and save this to your backend
    console.log("Saving API Key (first 5 chars):", apiKey.substring(0, 5));

    // Simulate a save operation
    setMessage("API Key saved successfully!");

    // Clear the message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Profile & Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="gemini-api-key"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Gemini API Key
          </label>
          <input
            type="password"
            id="gemini-api-key"
            autoComplete="new-password"
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setApiKey(e.target.value)
            }
            placeholder="Enter your Gemini API key"
            className={clsx(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
              "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-purple-500"
            )}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your key is stored securely and never shared.
          </p>
        </div>

        <button
          type="submit"
          className={clsx(
            "w-full px-4 py-2 text-sm font-medium text-white rounded-md",
            "bg-purple-600 hover:bg-purple-700",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          )}
        >
          Save API Key
        </button>

        {message && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {message}
          </p>
        )}
      </form>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Upload Documents</h2>
        <DocumentUpload />
      </div>
    </div>
  );
};