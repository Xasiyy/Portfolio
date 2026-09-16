import { RevealButton } from "@/components/reveal-button";
import { ShaderBackground } from "@/components/shader-background";


export function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <ShaderBackground />

      <main className="relative z-10 flex flex-col items-center gap-6 px-6 text-center text-white sm:px-12">
        <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-6xl">
          Bienvenue dans mon portfolio !
        </h1>
        <p className="font-serif italic max-w-xl text-lg text-white/80 sm:text-xl">
            Vous avez une idée audacieuse à concrétiser ? Je mets mon expertise en développement au service des projets les plus innovants pour leur donner vie. Découvrez mon profil complet via le bouton juste en dessous.
        </p>
        <RevealButton label="A propos de moi" />
      </main>
    </div>
  );
}