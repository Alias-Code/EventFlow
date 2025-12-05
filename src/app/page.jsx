import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-12 py-32 px-8 bg-white dark:bg-black">

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="EventFlow logo"
          width={120}
          height={30}
          priority
        />

        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 text-center">
          Bienvenue sur EventFlow
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
          Plateforme de gestion d'événements.
          Commencez en construisant vos premiers services.
        </p>

      </main>
    </div>
  );
}
