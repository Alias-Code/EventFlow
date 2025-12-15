import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
});

// Plus de "Metadata", on enlève tout (Next le gère encore)
export const metadata = {
  title: "EventFlow",
  description: "Event management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${montserrat.className} antialiased`}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
