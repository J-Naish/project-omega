"use client";

export default function Chat() {
  return (
    <div className="w-full max-w-6xl flex flex-col bg-yellow-50">
      <div className="flex-1">{/* Message Area */}</div>
      <div className="sticky bottom-0 pb-6">{/* Chat Input */}</div>
    </div>
  );
}
