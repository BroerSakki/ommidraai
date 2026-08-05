"use client";

import { useState } from "react";

export function PageHeader() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    "John joined Study Group"
  ];

  return (
    <header className="mb-8 flex items-start justify-between">
      {/* Left */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Groups
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Manage the groups you own and the groups you belong to.
        </p>
      </div>

      {/* Right */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative rounded-full p-2 text-3xl hover:bg-gray-200 transition"
        >
          ✉️

          {/* Notification count */}
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {notifications.length}
          </span>
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-72 rounded-lg border border-gray-300 bg-white shadow-lg z-50">
            <div className="border-b p-3 font-semibold">
              Notifications
            </div>

            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">
                No notifications.
              </p>
            ) : (
              <ul className="max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <li
                    key={index}
                    className="border-b p-3 text-sm hover:bg-gray-100"
                  >
                    {notification}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
}