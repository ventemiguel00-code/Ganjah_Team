import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <main className="welcome-page">
      <section className="welcome-stage" aria-label="Acceso a Ganjah Team">
        <div className="welcome-pitch" aria-hidden="true">
          <span className="welcome-pitch-circle" />
          <span className="welcome-pitch-area welcome-pitch-area-top" />
          <span className="welcome-pitch-area welcome-pitch-area-bottom" />
          <span className="welcome-pitch-goal welcome-pitch-goal-top" />
          <span className="welcome-pitch-goal welcome-pitch-goal-bottom" />
        </div>
        <div className="welcome-content">
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
            <h1 className="login-title">Ingresar</h1>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
