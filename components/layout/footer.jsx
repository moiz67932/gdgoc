export function Footer() {
  return (
    <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400">© 2025 ConvoAI. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-purple-400">
            Privacy
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400">
            Terms
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

