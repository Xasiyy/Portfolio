"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { SandboxModal } from "@/components/sandbox-modal";
import raycasting1 from "@/app/projects/cub3d/img/raycasting1.jpg";
import raycasting2 from "@/app/projects/cub3d/img/raycasting2.jpg";
import raycasting3 from "@/app/projects/cub3d/img/raycasting3.jpg";
import { ShinyButton } from "@/components/shiny-button";

export function Cub3DDetail() {
  const [project, setProject] = useState<any | null>(null);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "Cub3D") ?? null);
    });
  }, []);

  if (!project)
    return <p className="mx-auto max-w-3xl px-6 py-24">Chargement…</p>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#333333" }}>
      <Link
        href="/projects"
        aria-label="Retour aux projets"
        className="fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 shadow-lg backdrop-blur-md transition hover:bg-black/70"
      >
        ←
      </Link>

      <main className="mx-auto max-w-3xl px-6 py-24 text-white/80">
        <h1 className="font-serif text-4xl mb-8 text-white">Cub3D</h1>

        <div className="space-y-6 leading-relaxed">
          <p>
            Ce projet est un moteur graphique pseudo-3D à la première personne développé en C en
            utilisant la MiniLibX. L'objectif de ce projet est de comprendre et de re-créer les
            bases du raycasting en s'appuyant sur des principes mathématiques fondateurs
            (trigonométrie, vecteurs, géométrie spatiale).
          </p>

          <p>
            Déjà, nous allons clarifier ce qu'est la MiniLibX, plus communément appelée MLX. C'est
            une petite bibliothèque graphique minimale en C développée spécifiquement pour les
            étudiants de l'école 42. Elle a été conçue pour offrir une interface simplifiée
            permettant d'afficher des éléments graphiques et d'ouvrir une fenêtre sans devoir
            manipuler directement les API graphiques très complexes des systèmes d'exploitation.
            La MLX évite principalement aux étudiants de perdre du temps dans l'architecture
            interne des systèmes de fenêtrage et de se concentrer pleinement sur le code et le
            projet en lui-même. Bien qu'elle apporte beaucoup de simplicité, elle est aussi
            volontairement très rudimentaire et sans fonctions « magiques » complexes : elle nous
            force à coder nous-mêmes notre propre moteur graphique. C'est ce qui nous a amenés à
            coder le raycasting de ce projet.
          </p>

          <p>
            Je précise que si je parle au pluriel, c'est parce que sur ce projet nous étions deux.
            Nous avons travaillé en binôme sur l'intégralité de ce projet en prenant soin de nous
            répartir les tâches et de comprendre l'intégralité du code de l'un et de l'autre.
          </p>

          <p>
            La division du projet s'est faite naturellement : je me suis penché sur l'aspect
            mathématique tandis que mon collègue a travaillé sur le côté graphique du projet pour
            offrir le meilleur visuel possible. Le moteur s'inspire directement des méthodes
            d'intersections sur grille, largement inspirées par le développeur 3DSage dont le lien
            et le GitHub seront en fin d'article.
          </p>

        <p>
            Pour construire ce projet sans me perdre, j'ai fonctionnée par étapes. Je suis d'abord partis d'une carte 2D avec une minimap et mon joueur. Ensuite, j'ai tracé les rayons en 2D pour vérifier qu'ils rebondissaient correctement sur les murs. Ce n'est qu'une fois cette étape validée que je suis passés à la projection 3D.
        </p>

          <p>
            3DSage a créé une série de vidéos dans laquelle il explique comment passer d'une carte
            en 2D à un rendu pseudo-3D à la première personne sans utiliser de vraie 3D, uniquement
            avec du lancer de rayons (lien de la vidéo en bas de la page).
          </p>

          <p>
            En m'appuyant sur sa réflexion, je suis parvenu à avoir un résultat mathématique
            similaire : le raycasting repose sur une idée simple : lancer des rayons à partir de
            mon joueur pour mesurer la distance jusqu'au premier obstacle, puis utiliser cette
            distance pour déterminer la hauteur de la ligne de pixels à dessiner.
          </p>

          <p>
            Donc pour cela, on crée un vecteur direction (là où regarde le joueur) et un vecteur
            plan de caméra (perpendiculaire à la direction, qui définit la largeur du champ de
            vision). Ensuite, pour chaque colonne de pixels x de l'écran (de 0 à{" "}
            <code>SCREEN_WIDTH</code>), on calcule sa position sur une échelle allant de -1 (bord
            gauche) à +1 (bord droit).
          </p>

          <img src={raycasting1.src} alt="Schéma du calcul du vecteur direction et plan caméra" className="mx-auto max-w-md rounded-lg border border-white/10" />

          <p>
            Au lieu d'avancer pixel par pixel, on calcule avec sin et cos la distance nécessaire
            pour traverser exactement une case de la grille en X ou en Y.
          </p>

          <p>
            On compare le dernier saut de l'algorithme DDA (est-ce un saut vertical en X ou un
            saut horizontal en Y ?) combiné au sens du rayon. Comme les rayons envoyés sur les
            bords de l'écran sont plus longs que celui du centre, un mur plat apparaîtrait courbé :
            c'est l'effet <em>fish-eye</em>. Multiplier par le cosinus permet de mesurer la
            distance perpendiculaire au plan de l'écran, ce qui rend les murs parfaitement droits.
          </p>

          <img src={raycasting2.src} alt="Schéma de la correction de l'effet fish-eye" className="mx-auto max-w-md rounded-lg border border-white/10" />

          <p>Ensuite, on passe de la 2D à la 3D avec le théorème de Thalès et la perspective.</p>

          <img src={raycasting3.src} alt="Schéma du passage 2D vers 3D via le théorème de Thalès" className="mx-auto max-w-md rounded-lg border border-white/10" />

          <p>
            C'est la règle de la perspective conique : plus un objet est loin, plus sa taille est
            petite à l'écran. On calcule la hauteur exacte de la colonne de pixels à remplir au
            centre de l'écran, le reste devient le sol et le plafond.
          </p>

          <p>
            Enfin, pour le placage des textures .xpm, on repère le point d'impact exact sur la case pour extraire la bonne colonne d'images.Lors de l'implémentation, j'ai constaté un effet miroir sur certaines faces : les images apparaissaient à l'envers. J'ai résolu cela en identifiant l'orientation de la paroi (notamment Sud et Ouest) pour inverser le sens de balayage de la texture.Ce fut l'un de mes plus gros bugs (du moins le plus incompréhensible) qui m'a pris beaucoup de temps à comprendre dû à son origine encore mystérieuse...
          </p>

          <p>
            Je vous invite à tester le code en cliquant sur le bouton juste en dessous. Utiliser les touches "W A S D" pour vous déplacer et les flèches directionnelles pour orienter votre vue.
          </p>
        </div>

        {project.repoUrl && (
        <div className="mt-16 mb-16 flex justify-center">
            <ShinyButton onClick={() => setShowSandbox(true)} backgroundColor="#333333">
            Tester
            </ShinyButton>
        </div>
        )}

        {showSandbox && <SandboxModal projectId={project.id} onClose={() => setShowSandbox(false)} />}

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/50">
        <p className="mb-3 font-black text-white/70">Documents</p>
        <ul className="list-disc space-y-2 pl-5">
            <li>
            <a href="https://www.youtube.com/watch?v=gYRrGTC7GtA&t=3s" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                Vidéo 3DSage
            </a>
            </li>
            <li>
            <a href="https://github.com/3DSage/OpenGL-Raycaster_v1" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                github.com/3DSage/OpenGL-Raycaster_v1
            </a>
            </li>
            <li>
            <a href="https://harm-smits.github.io/42docs/libs/minilibx" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
                harm-smits.github.io/42docs/libs/minilibx
            </a>
            </li>
        </ul>

        <p className="mb-3 mt-8 font-black text-white/70">Collaborateurs</p>
        <a
            href="https://github.com/abollia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur-md transition hover:bg-black/70"
        >
            <img src="https://github.com/abollia.png" alt="abollia" className="h-7 w-7 rounded-full" />
            <span className="text-sm font-medium text-violet-400">abollia</span>
        </a>
        </div>

      </main>
    </div>
  );
}
