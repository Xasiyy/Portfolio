import { InfoCard } from "@/components/info-card";

export function PushSwapContentFr() {
  return (
    <>
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
    </>
  );
}


export function PushSwapContentEn() {
  return (
    <>
      <div className="space-y-6 leading-relaxed">
        <p>
          The 42 <strong className="text-white">Push_swap</strong> project consists of
          sorting a stack of unsorted integers using a secondary stack and a restricted set
          of instructions. The core goal is to generate the shortest possible sequence of
          instructions while keeping memory and time complexity under control.
        </p>
      </div>

      <InfoCard title="Allowed instructions">
        <ul className="space-y-2">
          <li><code>sa</code> / <code>sb</code> / <code>ss</code>: swaps the first two elements at the top of a stack (or of both stacks at once).</li>
          <li><code>pa</code> / <code>pb</code>: moves the top element of one stack to the top of the other.</li>
          <li><code>ra</code> / <code>rb</code> / <code>rr</code>: shifts all elements up (the first one becomes the last).</li>
          <li><code>rra</code> / <code>rrb</code> / <code>rrr</code>: shifts all elements down (the last one becomes the first).</li>
        </ul>
      </InfoCard>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
        Algorithmic principles: the "Turk Algorithm"
      </h2>

      <div className="space-y-6 leading-relaxed">
        <p>
          The approach based on A. Yogun's{" "}
          <strong className="text-white">Turk Algorithm</strong>{" "}
          (<em>Mechanical Turk</em>) favors a <em>greedy</em> strategy based on the lowest
          cost, move by move. Rather than pre-sorting the elements into chunks or arbitrary
          groups, each node of stack <code>A</code> is evaluated individually to calculate
          the exact number of rotations needed to place it in its ideal position in stack{" "}
          <code>B</code>.
        </p>
      </div>

      <InfoCard title="Overview of the sorting phases">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`                     [ Stack A (Unsorted) ]
                                │
                 Phase 1: Smart Transfer
               ┌────────────────┴────────────────┐
               │  While len(A) > 3:              │
               │  1. Compute targets and costs   │
               │  2. Find the 'cheapest' element │
               │  3. Rotate A & B (rr/rrr/etc)   │
               │  4. Run 'pb'                    │
               └────────────────┬────────────────┘
                                │
                      [ len(A) == 3 ]
                                │
                   Phase 2: Small Sort
                   ┌────────────┴────────────┐
                   │  sort_three(A) (≤ 2 ops)│
                   └────────────┬────────────┘
                                │
               Phase 3: Targeted Push Back
               ┌────────────────┴────────────────┐
               │  While B is not empty:          │
               │  1. Find the target in A        │
               │  2. Rotate A                    │
               │  3. Run 'pa'                    │
               └────────────────┬────────────────┘
                                │
                     Phase 4: Alignment
                     ┌──────────┴──────────┐
                     │ Final alignment of  │
                     │ the minimum element │
                     └──────────┬──────────┘
                                ▼
                     [ Stack A (Sorted) ]`}
        </pre>
      </InfoCard>

      <h3 className="font-serif text-xl mt-10 mb-4 text-white">
        Step 1: Initialization and parsing (<code>main.c</code>)
      </h3>
      <div className="space-y-4 leading-relaxed">
        <p>
          The main function handles the user input, converts the arguments and fills the
          data structure, a doubly linked list (<code>t_stack_node</code>).
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-white">2 elements</strong>: a simple <code>sa</code> is enough if the elements are not in order.</li>
          <li><strong className="text-white">3 elements</strong>: handled by <code>sort_three()</code>, which solves every possible case in 2 operations at most.</li>
          <li><strong className="text-white">More than 3 elements</strong>: triggers the global <code>sort_stacks()</code> method.</li>
        </ul>
      </div>

      <h3 className="font-serif text-xl mt-10 mb-4 text-white">
        Step 2: Target search and cost analysis (<code>set_target.c</code> &amp; <code>cost.c</code>)
      </h3>
      <div className="space-y-4 leading-relaxed">
        <p>
          Before each transfer from <code>A</code> to <code>B</code>, the algorithm updates
          the position of the nodes, where they stand relative to the median of the stack,
          and their respective target.
        </p>

        <p className="font-black text-white/90">A. Finding the targets (<code>set_target_a</code>)</p>
        <p>
          For an element of stack <code>A</code>, its target in stack <code>B</code> is the{" "}
          <strong className="text-white">largest element of B strictly smaller than itself</strong>.
          If no such element exists (the value is a global minimum or maximum in{" "}
          <code>B</code>), the target becomes the <strong className="text-white">maximum</strong> value of <code>B</code>.
        </p>
      </div>

      <InfoCard title="Example">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Stack B = [80, 50, 10]
- Node A = 60  ==> Target in B = 50 (the largest element < 60)
- Node A = 5   ==> Target in B = 80 (no element < 5, so the target is the Max)`}
        </pre>
      </InfoCard>

      <div className="space-y-4 leading-relaxed">
        <p className="font-black text-white/90">B. Median and cost evaluation (<code>cost.c</code>)</p>
        <p>
          Each node is given a cost based on its position relative to the middle of the
          stack (<code>median = len / 2</code>):
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Above the median</strong> (<code>above_median == true</code>):
            standard rotation (<code>ra</code> or <code>rb</code>), cost equal to its index.
          </li>
          <li>
            <strong className="text-white">Below the median</strong> (<code>above_median == false</code>):
            reverse rotation (<code>rra</code> or <code>rrb</code>), cost equal to{" "}
            <code>taille_pile - index</code>.
          </li>
        </ul>
        <p>
          The cost of a node is the sum of the moves needed to bring that node to the top
          of <code>A</code> <strong className="text-white">and</strong> to bring its target to
          the top of <code>B</code>.
        </p>

        <p className="font-black text-white/90">C. Selecting the cheapest element (<code>set_cheapest</code>)</p>
        <p>
          The function goes through the nodes of <code>A</code> and marks as <code>cheapest</code>{" "}
          the one with the lowest total cost.
        </p>
      </div>

      <h3 className="font-serif text-xl mt-10 mb-4 text-white">
        Step 3: Running phase 1 (<code>push_to_b</code> in <code>algo.c</code>)
      </h3>
      <p className="leading-relaxed">
        This loop moves nodes out of <code>A</code> until only 3 are left.
      </p>

      <InfoCard>
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`Stack A                     Stack B
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
        <p>At each iteration:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Compute the positions, targets and costs (<code>init_nodes_a</code>).</li>
          <li>Take the node marked as <code>cheapest</code>.</li>
          <li>
            Prepare the stacks (<code>prep</code>): align both at once with combined
            rotations (<code>rr</code> if both are above the median, <code>rrr</code>{" "}
            if both are below) to reduce the overall cost.
          </li>
          <li>Push the element onto stack <code>B</code> (<code>pb</code>).</li>
        </ol>
      </div>

      <h3 className="font-serif text-xl mt-10 mb-4 text-white">
        Step 4: Pushing back and final alignment (<code>push_back_to_a</code> &amp; <code>final_sort</code>)
      </h3>
      <div className="space-y-4 leading-relaxed">
        <p>Once only 3 elements are left in <code>A</code>, they are sorted directly.</p>

        <p className="font-black text-white/90">A. Pushing back into A (<code>push_back_to_a</code>)</p>
        <p>
          The elements of <code>B</code> are moved back to <code>A</code>. For each node of{" "}
          <code>B</code>, its target in <code>A</code> is now{" "}
          <strong className="text-white">the smallest element of A greater than itself</strong>.
          If the value is greater than everything in <code>A</code>, the target is the{" "}
          <strong className="text-white">minimum</strong> value of <code>A</code>.
        </p>

        <p className="font-black text-white/90">B. Finishing (<code>final_sort</code>)</p>
        <p>
          Once all the elements have been pushed back, the stack is almost sorted but
          circularly shifted. The function finds the minimum value and performs simple
          rotations (<code>ra</code> or <code>rra</code>), depending on its position relative
          to the median, to bring it to the top of <code>A</code>.
        </p>
      </div>

      <InfoCard title="Complexity and performance">
        <ul className="space-y-2">
          <li><strong className="text-white">3 elements</strong>: ≤ 2 instructions.</li>
          <li><strong className="text-white">100 elements</strong>: ≈ 550 – 650 instructions (below the threshold for the maximum grade).</li>
          <li><strong className="text-white">500 elements</strong>: ≈ 4800 – 5300 instructions (below the 5500 limit).</li>
          <li><strong className="text-white">Memory management</strong>: everything is freed with <code>free_stack()</code> to avoid any memory leaks (<code>leaks</code>).</li>
        </ul>
      </InfoCard>

      <h2 className="font-serif text-2xl mt-12 mb-6 text-white">
        See the algorithm in action
      </h2>

      <div className="space-y-4 leading-relaxed">
        <p>
          The <strong className="text-white">Try it</strong> button below launches the visualizer by{" "}
          <a href="https://github.com/o-reo/push_swap_visualizer" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">o-reo</a>{" "}
          connected directly to my <code>push_swap</code>. Each bar represents a number: the
          longer the bar, the larger the value. The left column is stack <code>A</code>, the
          right one is stack <code>B</code>.
        </p>
      </div>

      <InfoCard title="Quick tutorial">
        <ol className="list-decimal space-y-4 pl-5">
          <li>
            <strong className="text-white">Choose the size</strong>: in the{" "}
            <strong className="text-white">Values</strong> window, set the <em>Count</em> field with
            the <code>-</code> / <code>+</code> buttons, or click in the field and type a number
            directly (for example <code>100</code>).
          </li>
          <li>
            <strong className="text-white">Shuffle</strong>: click{" "}
            <strong className="text-white">Shuffle</strong>. The generated numbers appear in the{" "}
            <em>Space separated values</em> field. You can also type your own values there,
            separated by spaces.
          </li>
          <li>
            <strong className="text-white">Compute</strong>: click{" "}
            <strong className="text-white">Compute</strong>. The visualizer runs{" "}
            <code>push_swap</code> with these values and shows <code>OK</code> once the
            computation is done. Leave the <em>push_swap file path</em> field as it is: it
            already points to my program.
          </li>
          <li>
            <strong className="text-white">Read the instructions</strong>: the{" "}
            <strong className="text-white">Commands</strong> window shows the total number of moves
            (<em>Count</em>) and the list of generated instructions (<code>pb</code>,{" "}
            <code>ra</code>, <code>rrr</code>…).
          </li>
          <li>
            <strong className="text-white">Start the animation</strong>: in{" "}
            <strong className="text-white">Controls</strong>, click{" "}
            <strong className="text-white">Start</strong>. Drag the <em>Speed</em> slider to the
            right to speed it up, which is essential from 100 values upward.
          </li>
          <li>
            <strong className="text-white">Step through it</strong>:{" "}
            <strong className="text-white">Pause</strong> freezes the animation,{" "}
            <strong className="text-white">Step</strong> moves forward by a single instruction and{" "}
            <strong className="text-white">Reverse</strong> plays it backwards. It is the best way
            to watch the algorithm pick the <code>cheapest</code> element.
          </li>
        </ol>
      </InfoCard>

      <div className="space-y-4 leading-relaxed">
        <p className="font-black text-white/90">What to look for</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white">Phase 1</strong>: the bars move one by one into{" "}
            <code>B</code>, which fills up in descending order, until only 3 elements are left
            in <code>A</code>.
          </li>
          <li>
            <strong className="text-white">Phase 3</strong>: the bars come back into{" "}
            <code>A</code>, each one directly in its place.
          </li>
          <li>
            <strong className="text-white">Phase 4</strong>: a few final rotations bring the
            smallest value to the top, and the stack forms a perfect staircase.
          </li>
        </ul>
        <p className="text-sm text-white/50">
          Tip: the windows can hide some of the bars. Move them by dragging their title bar,
          or collapse them with the ▼ arrow. If the screen stays black, click "Retry" at the
          bottom of the window.
        </p>
      </div>
    </>
  );
}
