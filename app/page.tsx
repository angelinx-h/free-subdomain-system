import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Free Subdomain Registration
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Register and manage free subdomains with full DNS record control.
          Simple, fast, and completely free.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
