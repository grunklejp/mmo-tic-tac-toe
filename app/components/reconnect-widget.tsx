export function ReconnectWidget() {
  return (
    <span className="absolute top-auto right-auto bottom-4 inset-x-2 md:top-5 md:right-5 md:bottom-auto md:inset-x-auto z-50 rounded-sm shadow-md bg-white p-4 border">
      <p className="text-gray-700 font-medium flex items-center">
        🚧 Disconnected from server. 🚧
      </p>
      <button
        onClick={() => {
          window.location.reload();
        }}
        className="mt-3 p-1 px-2 border flex items-center gap-1 border-green-600 bg-green-100 text-green-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m19 5 3-3" />
          <path d="m2 22 3-3" />
          <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
          <path d="M7.5 13.5 10 11" />
          <path d="M10.5 16.5 13 14" />
          <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />
        </svg>
        Reconnect
      </button>
    </span>
  );
}
