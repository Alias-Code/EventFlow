import Link from "next/link";
import { Calendar, Ticket, ShieldCheck, Bell, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white dark:bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Nouvelle plateforme disponible
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
              Gérez vos événements <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                en toute simplicité
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              EventFlow est la solution complète pour créer, gérer et participer à des événements inoubliables. 
              Architecture microservices robuste pour une scalabilité sans limite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/register" 
                className="group flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 font-semibold text-lg"
              >
                Commencer gratuitement
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link 
                href="/events" 
                className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-semibold text-lg text-gray-700 dark:text-gray-300"
              >
                Explorer les événements
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une suite d'outils puissants pour les organisateurs et une expérience fluide pour les participants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Calendar className="text-blue-600" size={32} />}
              title="Gestion d'événements"
              description="Créez et personnalisez vos événements en quelques clics. Suivez les inscriptions en temps réel."
            />
            <FeatureCard 
              icon={<Ticket className="text-indigo-600" size={32} />}
              title="Billetterie Intelligente"
              description="Système de réservation fluide avec génération de QR codes et validation instantanée."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-600" size={32} />}
              title="Paiements Sécurisés"
              description="Transactions protégées et gestion automatisée des remboursements en cas d'annulation."
            />
            <FeatureCard 
              icon={<Bell className="text-amber-600" size={32} />}
              title="Notifications Live"
              description="Restez informé des changements importants par email et notifications en temps réel."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Propulsé par une architecture moderne
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                EventFlow repose sur une architecture microservices de pointe garantissant performance et fiabilité.
              </p>
              <ul className="space-y-4">
                {[
                  "Microservices NestJS indépendants",
                  "Communication asynchrone via RabbitMQ",
                  "Bases de données PostgreSQL isolées",
                  "Frontend Next.js haute performance"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="grid grid-cols-2 gap-8 text-center opacity-50">
                <div className="text-2xl font-bold">NestJS</div>
                <div className="text-2xl font-bold">Next.js</div>
                <div className="text-2xl font-bold">Docker</div>
                <div className="text-2xl font-bold">RabbitMQ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>© 2025 EventFlow. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
      <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
