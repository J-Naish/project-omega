export default function LoadingMessage() {
  return (
    <div className="relative">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-spin blur-[1px] shadow-[0_-3px_12px_0_rgb(186,66,255),0_3px_12px_0_rgb(0,225,255)]"></div>
      <div className="absolute inset-0 w-8 h-8 rounded-full bg-gray-900 blur-[6px]"></div>
    </div>
  );
}
