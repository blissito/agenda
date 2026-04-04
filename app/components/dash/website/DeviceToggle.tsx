type Device = "Desktop" | "Tablet" | "Mobile"

export function DeviceToggle({
  activeDevice,
  onDeviceChange,
}: {
  activeDevice: Device
  onDeviceChange: (device: Device) => void
}) {
  return (
    <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
      <DeviceButton
        active={activeDevice === "Desktop"}
        onClick={() => onDeviceChange("Desktop")}
        title="Desktop"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </DeviceButton>
      <DeviceButton
        active={activeDevice === "Tablet"}
        onClick={() => onDeviceChange("Tablet")}
        title="Tablet"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      </DeviceButton>
      <DeviceButton
        active={activeDevice === "Mobile"}
        onClick={() => onDeviceChange("Mobile")}
        title="Mobile"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      </DeviceButton>
    </div>
  )
}

function DeviceButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-[#333] text-white"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  )
}
