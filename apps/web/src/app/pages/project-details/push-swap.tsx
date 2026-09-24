"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { InfoCard } from "@/components/info-card";
import { SandboxModal } from "@/components/sandbox-modal";
import { ShinyButton } from "@/components/shiny-button";

export function PushSwapDetail() {
  const [showSandbox, setShowSandbox] = useState(false);
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "push_swap") ?? null);
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
        <h1 className="font-serif text-4xl mb-8 text-white">Push_swap</h1>

        <div className="space-y-6 leading-relaxed">
          <p>
            Le projet <strong className="text-white">Push_swap</strong> de l'École 42 consiste à
            trier une pile de nombres entiers non triés en utilisant une pile secondaire et un jeu
            d'instructions restreint. L'objectif fondamental est de générer la séquence
            d'instructions la plus courte possible tout en conservant une complexité en mémoire et
            en temps maîtrisée.
          </p>
        </div>

        <InfoCard title="Les instructions autorisées">
          <ul className="space-y-2">
            <li><code>sa</code> / <code>sb</code> / <code>ss</code> : échange les deux premiers éléments au sommet d'une pile (ou des deux simultanément).</li>
            <li><code>pa</code> / <code>pb</code> : déplace le premier élément du sommet d'une pile vers le sommet de l'autre.</li>
            <li><code>ra</code> / <code>rb</code> / <code>rr</code> : décale tous les éléments vers le haut (le premier devient le dernier).</li>
            <li><code>rra</code> / <code>rrb</code> / <code>rrr</code> : décale tous les éléments vers le bas (le dernier devient le premier).</li>
          </ul>
        </InfoCard>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
          Principes algorithmiques : le « Turk Algorithm »
        </h2>

        <div className="space-y-6 leading-relaxed">
          <p>
            L'approche reposant sur l'<strong className="text-white">Algorithme Turc</strong>{" "}
            (<em>Mechanical Turk</em>) d'A. Yogun privilégie une stratégie gloutonne
            (<em>greedy</em>) basée sur le coût minimal coup par coup. Plutôt que de pré-trier les
            éléments par blocs ou par paquets arbitraires, chaque nœud de la pile <code>A</code> est
            évalué individuellement pour calculer le nombre exact de rotations nécessaires pour le
            placer à sa position idéale dans la pile <code>B</code>.
          </p>
        </div>

        <InfoCard title="Schéma global des phases du tri">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`                     [ Stack A (Non triée) ]
                                │
               Phase 1 : Transfert Intelligent
               ┌────────────────┴────────────────┐
               │  Tant que len(A) > 3 :          │
               │  1. Calculer cibles et coûts    │
               │  2. Trouver l'élément 'cheapest'│
               │  3. Orienter A & B (rr/rrr/etc) │
               │  4. Exécuter 'pb'               │
               └────────────────┬────────────────┘
                                │
                      [ len(A) == 3 ]
                                │
                   Phase 2 : Tri Réduit
                   ┌────────────┴────────────┐
                   │  sort_three(A) (≤ 2 ops)│
                   └────────────┬────────────┘
                                │
               Phase 3 : Réinjection Ciblée
               ┌────────────────┴────────────────┐
               │  Tant que B n'est pas vide :    │
               │  1. Trouver la cible dans A     │
               │  2. Orienter A                  │
               │  3. Exécuter 'pa'               │
               └────────────────┬────────────────┘
                                │
                     Phase 4 : Alignement
                     ┌──────────┴──────────┐
                     │ Alignement final de │
                     │ l'élément minimum   │
                     └──────────┬──────────┘
                                ▼
                     [ Stack A (Triée) ]`}
          </pre>
        </InfoCard>

        <h3 className="font-serif text-xl mt-10 mb-4 text-white">
          Étape 1 : Initialisation et parsing (<code>main.c</code>)
        </h3>
        <div className="space-y-4 leading-relaxed">
          <p>
            La fonction principale prend en charge l'entrée utilisateur, effectue la conversion des
            arguments et alimente la structure de données sous forme de liste doublement chaînée
            (<code>t_stack_node</code>).
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-white">2 éléments</strong> : un simple <code>sa</code> suffit si les éléments ne sont pas ordonnés.</li>
            <li><strong className="text-white">3 éléments</strong> : traité par <code>sort_three()</code>, qui résout tous les cas possibles en 2 opérations maximum.</li>
            <li><strong className="text-white">Plus de 3 éléments</strong> : déclenchement de la méthode globale <code>sort_stacks()</code>.</li>
          </ul>
        </div>

        <h3 className="font-serif text-xl mt-10 mb-4 text-white">
          Étape 2 : Recherche de cible et analyse des coûts (<code>set_target.c</code> &amp; <code>cost.c</code>)
        </h3>
        <div className="space-y-4 leading-relaxed">
          <p>
            Avant chaque transfert de <code>A</code> vers <code>B</code>, l'algorithme met à jour
            la position des nœuds, leur situation par rapport à la médiane de la pile, ainsi que
            leur cible respective.
          </p>

          <p className="font-black text-white/90">A. Détermination des cibles (<code>set_target_a</code>)</p>
          <p>
            Pour un élément de la pile <code>A</code>, sa cible dans la pile <code>B</code> est le{" "}
            <strong className="text-white">plus grand élément de B strictement inférieur à lui-même</strong>.
            Si un tel élément n'existe pas (la valeur est un minimum ou un maximum global dans{" "}
            <code>B</code>), la cible devient la valeur <strong className="text-white">maximale</strong> de <code>B</code>.
          </p>
        </div>

        <InfoCard title="Exemple">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Pile B = [80, 50, 10]
- Nœud A = 60  ==> Cible dans B = 50 (le plus grand élément < 60)
- Nœud A = 5   ==> Cible dans B = 80 (aucun élément < 5, donc la cible est le Max)`}
          </pre>
        </InfoCard>

        <div className="space-y-4 leading-relaxed">
          <p className="font-black text-white/90">B. Médiane et évaluation des coûts (<code>cost.c</code>)</p>
          <p>
            Chaque nœud se voit attribuer un coût selon sa position par rapport au milieu de la
            pile (<code>median = len / 2</code>) :
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Au-dessus de la médiane</strong> (<code>above_median == true</code>) :
              rotation standard (<code>ra</code> ou <code>rb</code>), coût égal à son index.
            </li>
            <li>
              <strong className="text-white">En dessous de la médiane</strong> (<code>above_median == false</code>) :
              rotation inverse (<code>rra</code> ou <code>rrb</code>), coût égal à{" "}
              <code>taille_pile - index</code>.
            </li>
          </ul>
          <p>
            Le coût d'un nœud correspond à la somme des mouvements pour ramener ce nœud au sommet
            de <code>A</code> <strong className="text-white">et</strong> pour ramener sa cible au
            sommet de <code>B</code>.
          </p>

          <p className="font-black text-white/90">C. Sélection de l'élément le moins cher (<code>set_cheapest</code>)</p>
          <p>
            La fonction parcourt les nœuds de <code>A</code> et marque comme <code>cheapest</code>{" "}
            celui qui accumule le coût le plus bas.
          </p>
        </div>

        <h3 className="font-serif text-xl mt-10 mb-4 text-white">
          Étape 3 : Exécution de la phase 1 (<code>push_to_b</code> dans <code>algo.c</code>)
        </h3>
        <p className="leading-relaxed">
          Cette boucle extrait les nœuds de <code>A</code> jusqu'à ce qu'il n'en reste plus que 3.
        </p>

        <InfoCard>
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Pile A                      Pile B
 ┌───┐                       ┌───┐
 │ 42│ ── (Cheapest) ──┐     │ 80│
 ├───┤                 │     ├───┤
 │ 15│                 └────►│ 30│
 ├───┤                       └───┘
 │ 99│
 └───┘`}
          </pre>
        </InfoCard>

        <div className="space-y-4 leading-relaxed">
          <p>À chaque itération :</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Calcul des positions, cibles et coûts (<code>init_nodes_a</code>).</li>
            <li>Extraction du nœud marqué comme <code>cheapest</code>.</li>
            <li>
              Préparation des piles (<code>prep</code>) : alignement simultané via des rotations
              combinées (<code>rr</code> si les deux sont au-dessus de la médiane, <code>rrr</code>{" "}
              si les deux sont en dessous) afin de réduire le coût global.
            </li>
            <li>Poussée de l'élément vers la pile <code>B</code> (<code>pb</code>).</li>
          </ol>
        </div>

        <h3 className="font-serif text-xl mt-10 mb-4 text-white">
          Étape 4 : Réinjection et alignement final (<code>push_back_to_a</code> &amp; <code>final_sort</code>)
        </h3>
        <div className="space-y-4 leading-relaxed">
          <p>Une fois qu'il ne reste que 3 éléments dans <code>A</code>, ces derniers sont triés directement.</p>

          <p className="font-black text-white/90">A. Réinjection dans A (<code>push_back_to_a</code>)</p>
          <p>
            On rapatrie les éléments de <code>B</code> vers <code>A</code>. Pour chaque nœud de{" "}
            <code>B</code>, sa cible dans <code>A</code> est cette fois{" "}
            <strong className="text-white">le plus petit élément de A supérieur à lui-même</strong>.
            Si la valeur est plus grande que tout le contenu de <code>A</code>, la cible est la
            valeur <strong className="text-white">minimale</strong> de <code>A</code>.
          </p>

          <p className="font-black text-white/90">B. Finalisation (<code>final_sort</code>)</p>
          <p>
            Lorsque tous les éléments ont été réinjectés, la pile est quasi triée mais présente un
            décalage circulaire. La fonction localise la valeur minimale et effectue des rotations
            simples (<code>ra</code> ou <code>rra</code>) selon sa position par rapport à la
            médiane pour l'amener au sommet de <code>A</code>.
          </p>
        </div>

        <InfoCard title="Complexité et performance">
          <ul className="space-y-2">
            <li><strong className="text-white">3 éléments</strong> : ≤ 2 instructions.</li>
            <li><strong className="text-white">100 éléments</strong> : ≈ 550 – 650 instructions (sous le seuil de la note maximale).</li>
            <li><strong className="text-white">500 éléments</strong> : ≈ 4800 – 5300 instructions (sous le plafond de 5500).</li>
            <li><strong className="text-white">Gestion mémoire</strong> : libération systématique via <code>free_stack()</code> pour éviter toute fuite (<code>leaks</code>).</li>
          </ul>
        </InfoCard>

        <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
          Voir l'algorithme en action
        </h2>

        <div className="space-y-4 leading-relaxed">
          <p>
            Le bouton <strong className="text-white">Tester</strong> ci-dessous lance le visualizer de{" "}
            <a href="https://github.com/o-reo/push_swap_visualizer" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">o-reo</a>{" "}
            branché directement sur mon <code>push_swap</code>. Chaque barre représente un nombre :
            plus la barre est longue, plus la valeur est grande. La colonne de gauche correspond à la
            pile <code>A</code>, celle de droite à la pile <code>B</code>.
          </p>
        </div>

        <InfoCard title="Mini tuto">
          <ol className="list-decimal space-y-4 pl-5">
            <li>
              <strong className="text-white">Choisir la taille</strong> : dans la fenêtre{" "}
              <strong className="text-white">Values</strong>, réglez le champ <em>Count</em> avec les
              boutons <code>-</code> / <code>+</code>, ou cliquez dans le champ et tapez directement un
              nombre (par exemple <code>100</code>).
            </li>
            <li>
              <strong className="text-white">Mélanger</strong> : cliquez sur{" "}
              <strong className="text-white">Shuffle</strong>. Les nombres générés apparaissent dans le
              champ <em>Space separated values</em>. Vous pouvez aussi y écrire vos propres valeurs,
              séparées par des espaces.
            </li>
            <li>
              <strong className="text-white">Calculer</strong> : cliquez sur{" "}
              <strong className="text-white">Compute</strong>. Le visualizer exécute{" "}
              <code>push_swap</code> avec ces valeurs et affiche <code>OK</code> une fois le calcul
              terminé. Laissez le champ <em>push_swap file path</em> tel quel : il pointe déjà vers
              mon programme.
            </li>
            <li>
              <strong className="text-white">Lire les instructions</strong> : la fenêtre{" "}
              <strong className="text-white">Commands</strong> indique le nombre total de coups
              (<em>Count</em>) et la liste des instructions générées (<code>pb</code>,{" "}
              <code>ra</code>, <code>rrr</code>…).
            </li>
            <li>
              <strong className="text-white">Lancer l'animation</strong> : dans{" "}
              <strong className="text-white">Controls</strong>, cliquez sur{" "}
              <strong className="text-white">Start</strong>. Faites glisser le curseur{" "}
              <em>Speed</em> vers la droite pour accélérer, c'est indispensable à partir de 100
              valeurs.
            </li>
            <li>
              <strong className="text-white">Analyser pas à pas</strong> :{" "}
              <strong className="text-white">Pause</strong> fige l'animation,{" "}
              <strong className="text-white">Step</strong> avance d'une seule instruction et{" "}
              <strong className="text-white">Reverse</strong> rejoue à l'envers. C'est le meilleur
              moyen de voir l'algorithme choisir l'élément <code>cheapest</code>.
            </li>
          </ol>
        </InfoCard>

        <div className="space-y-4 leading-relaxed">
          <p className="font-black text-white/90">Ce qu'il faut observer</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Phase 1</strong> : les barres passent une à une dans{" "}
              <code>B</code>, qui se remplit dans l'ordre décroissant, jusqu'à ce qu'il ne reste que 3
              éléments dans <code>A</code>.
            </li>
            <li>
              <strong className="text-white">Phase 3</strong> : les barres reviennent dans{" "}
              <code>A</code>, chacune directement à sa place.
            </li>
            <li>
              <strong className="text-white">Phase 4</strong> : quelques dernières rotations
              alignent la plus petite valeur au sommet, et la pile forme un escalier parfait.
            </li>
          </ul>
          <p className="text-sm text-white/50">
            Astuce : les fenêtres peuvent cacher une partie des barres. Déplacez-les en les
            attrapant par leur titre, ou repliez-les avec la flèche ▼. Si l'écran reste noir,
            cliquez sur « Réessayer » en bas de la fenêtre.
          </p>
        </div>

        {project.repoUrl && (
        <div className="mt-16 mb-16 flex justify-center">
            <ShinyButton onClick={() => setShowSandbox(true)} backgroundColor="#333333">
            Tester
            </ShinyButton>
        </div>
        )}

        {showSandbox && (
        <SandboxModal projectId={project.id} onClose={() => setShowSandbox(false)} size="large" />
        )}

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/50">
          <p className="mb-3 font-black text-white/70">Documents</p>
          <ul className="list-disc space-y-2 pl-5">
          <li>
            <a href="https://medium.com/@ayogun/push-swap-c1f5d2d41e97" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
              A. Yogun — Push_swap (Turk Algorithm) sur Medium
            </a>
          </li>
          <li>
            <a href="https://github.com/o-reo/push_swap_visualizer" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">
              github.com/o-reo/push_swap_visualizer
            </a>
          </li>
          </ul>
        </div>

        <p className="mb-3 mt-8 font-black text-white/70">Dépôt du projet</p>
        <a
          href="https://github.com/Xasiyy/push_swap"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
          style={{ backgroundColor: "#333333" }}
        >
          <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">push_swap</span>
            <span className="text-xs text-white/50 transition group-hover:text-violet-300">
              Voir le projet sur GitHub ↗
            </span>
          </div>
        </a>
      </main>
    </div>
  );
}
