import ThemeChanger from "@/components/theme-changer";

export function Navbar() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          WhatsApp Bulk Sender
        </h1>
        <div className="flex items-center gap-4">
          {/* <span className="hidden md:inline text-sm">
            Connected to WhatsApp
          </span>
          <div className="h-3 w-3 bg-green-300 rounded-full"></div> */}
          <ThemeChanger />
        </div>
      </div>
    </header>
  );
}
