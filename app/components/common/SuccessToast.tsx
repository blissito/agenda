export const SuccessToast = ({
  message,
  type = "success",
}: {
  message: string | null
  type?: "success" | "error"
}) => {
  if (!message) return null
  const isError = type === "error"
  return (
    <div className="fixed bottom-6 left-0 right-0 z-[600] flex justify-center pointer-events-none">
      <div className="px-5 py-3 bg-white text-brand_dark rounded-full shadow-lg text-sm font-medium flex items-center gap-2 max-w-[90vw] pointer-events-auto">
        {isError ? (
          <svg
            className="w-5 h-5 shrink-0 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 shrink-0 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {message}
      </div>
    </div>
  )
}
