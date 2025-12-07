import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          EventFlow
        </Link>
        <div className="space-x-4">
          <Link href="/auth/login" className="hover:text-gray-300">
            Connexion
          </Link>
          <Link href="/auth/register" className="hover:text-gray-300">
            Inscription
          </Link>
        </div>
      </div>
    </nav>
  );
}
