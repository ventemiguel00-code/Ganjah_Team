import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <main className="welcome-page">
      <section className="welcome-stage" aria-label="Acceso a Ganjah Team">
        <div className="welcome-brand">
          <Image
            src="/ganjah-team-logo-extracted.png"
            alt="Ganjah Team"
            width={944}
            height={1100}
            priority
            unoptimized
          />
        </div>

        <div className="welcome-access">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
