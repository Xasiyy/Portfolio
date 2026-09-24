"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/api";
import { SandboxModal } from "@/components/sandbox-modal";
import { ShinyButton } from "@/components/shiny-button";
import { InfoCard } from "@/components/info-card";

export function MinishellDetail() {
  const [project, setProject] = useState<any | null>(null);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    getProjects().then((projects) => {
      setProject(projects.find((p: any) => p.title === "Minishell") ?? null);
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
        <h1 className="font-serif text-4xl mb-8 text-white">Minishell</h1>

        <div className="space-y-6 leading-relaxed">
          <p>
            Minishell est un projet majeur du cursus 42 dont l'objectif est de
            recréer un shell Unix fonctionnel, robuste et inspiré de Bash. Le
            programme affiche un prompt, gère l'historique via la
            bibliothèque readline, analyse des lignes de commandes complexes
            et exécute les binaires via <code>execve</code> ou via des
            builtins réimplémentées à la main.
          </p>

          <p>
            Bien qu'il s'agisse d'un projet en binôme, l'intégralité de
            l'architecture (parsing, pipeline d'exécution, gestion mémoire et
            signaux) a été conçue et codée de manière centralisée pour
            offrir une cohérence parfaite et garantir zéro fuite mémoire (à
            l'exception des fuites internes tolérées de readline). Pour des
            raisons de problèmes rencontrés pendant le cursus, mon collègue a
            dû intervenir sur la fin du projet — il a réglé énormément de
            bugs et de leaks, sans lesquels le projet n'aurait pas été
            abouti.
          </p>

          <p>
            Le projet respecte à 100 % la Norme 42 et n'utilise qu'une seule
            variable globale (<code>g_signal</code>, qui a largement
            compliqué la tâche), strictement réservée à la réception des
            signaux.
          </p>
        </div>

        <InfoCard title="Architecture du projet">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`minishell/
├── include/
│   └── minishell.h          # Structures & prototypes globaux
├── src/
│   ├── main/
│   │   └── main.c           # Point d'entrée, init t_shell
│   ├── shell_main/
│   │   └── shell_main.c     # Boucle principale readline
│   ├── line_handler/
│   │   └── line_handler.c   # Chef d'orchestre du traitement
│   ├── parsing/              # Lexer, Expander, Splitter & Syntax Check
│   ├── execution/             # Fork, Execve, Pipes & Redirections
│   ├── builtins/               # Implémentation des 7 builtins + Heredoc
│   ├── env/                     # Gestion dynamique de l'environnement
│   ├── signal/                   # Gestionnaires SIGINT / SIGQUIT
│   └── free/                      # Nettoyage mémoire & fermeture de FDs
├── libft/                    # Bibliothèque C personnelle
├── ft_printf/                 # Implémentation de printf
└── get_next_line/              # Lecture ligne par ligne`}
          </pre>
        </InfoCard>

        <InfoCard title="Flux d'exécution & fonctionnement général">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`main()
  ↓
start_shell_loop()
  ↓
readline()  ──►  "cmd1 | cmd2 > file.txt"  ──►  add_history()
  ↓
handle_line()
  ├── lexer()                 ──►  Découpage en liste de t_token
  ├── split_pipeline_tokens() ──►  Séparation par rapport aux pipes '|'
  ├── parse_all_pipelines()   ──►  Expansion ($VAR) + Construction t_command & t_redir
  └── execute_all_pipelines()
        ├── Pipeline simple   ──►  execute_single_command() (Builtin parent / execve)
        └── Pipeline complexe ──►  execute_pipeline() (Pipes, fork, dup2, waitpid)
  ↓
free_all() & retour au prompt`}
          </pre>
        </InfoCard>

        <div className="space-y-6 leading-relaxed">
          <p>
            <strong className="text-white">Phase de parsing.</strong> Le
            parsing transforme une chaîne brute en une structure de données
            exploitable sans ambiguïté. Le lexer parcourt la ligne
            caractère par caractère et génère une liste chaînée de{" "}
            <code>t_token</code>. Chaque token conserve l'information sur son
            type et son niveau de protection par les quotes : les quotes
            simples protègent intégralement leur contenu (aucune expansion
            de variable), tandis que les quotes doubles protègent les
            espaces et les opérateurs, mais autorisent l'expansion avec{" "}
            <code>$</code>. Avant tout traitement lourd, la syntaxe est
            contrôlée : le shell bloque immédiatement les commandes
            invalides avec un code de retour 2.
          </p>

          <p>
            <strong className="text-white">
              Exécution et redirections.
            </strong>{" "}
            Pour les commandes simples, si la commande est une builtin devant
            modifier l'environnement du parent (<code>cd</code>,{" "}
            <code>exit</code>, <code>export</code>, <code>unset</code>), elle
            est exécutée dans le processus parent sans aucun fork. Si c'est
            un binaire externe ou une builtin avec redirection, un fork est
            généré. Pour un pipeline de N commandes reliées par des pipes, on
            crée N − 1 tuyaux via <code>pipe()</code>. Chaque commande est
            lancée dans un fils via <code>fork()</code> : le descripteur
            d'écriture du pipe précédent est dupliqué sur{" "}
            <code>STDIN_FILENO</code> et l'entrée du suivant sur{" "}
            <code>STDOUT_FILENO</code> grâce à <code>dup2()</code>. Tous les
            FDs inutiles sont fermés pour éviter les blocages, et le parent
            attend la fin de tous les enfants via <code>waitpid()</code>.
          </p>

          <p>
            La gestion des redirections se fait dans{" "}
            <code>handle_redirections()</code> : <code>&lt;</code> ouvre en{" "}
            <code>O_RDONLY</code> puis <code>dup2(fd, STDIN_FILENO)</code> ;{" "}
            <code>&gt;</code> ouvre en{" "}
            <code>O_WRONLY | O_CREAT | O_TRUNC</code> puis{" "}
            <code>dup2(fd, STDOUT_FILENO)</code> ;{" "}
            <code>&gt;&gt;</code> ouvre en{" "}
            <code>O_WRONLY | O_CREAT | O_APPEND</code> puis{" "}
            <code>dup2(fd, STDOUT_FILENO)</code>. Le heredoc (
            <code>&lt;&lt;</code>) génère un fichier temporaire unique dans{" "}
            <code>/tmp/minishell_heredoc_PID</code>, lit l'entrée avec{" "}
            <code>readline("&gt; ")</code> jusqu'au délimiteur, y applique
            l'expansion de variables (sauf si le délimiteur était entre
            quotes), puis injecte ce fichier sur <code>STDIN_FILENO</code>.
            Le fichier est supprimé du disque dès son ouverture grâce à{" "}
            <code>unlink()</code>.
          </p>
        </div>

        <InfoCard title="Les builtins implémentées">
          <p className="mb-4 text-sm text-white/70">
            Toutes les builtins ont été réécrites à la main, sans appel
            système externe.
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white">
                <th className="py-2 pr-4 font-serif">Builtin</th>
                <th className="py-2 font-serif">
                  Description & implémentation technique
                </th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">echo</td>
                <td className="py-2">
                  Affiche les arguments sur stdout. Gère l'option{" "}
                  <code>-n</code> (suppression du saut de ligne final).
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">cd</td>
                <td className="py-2">
                  Modifie le répertoire courant via <code>chdir()</code>. Met
                  à jour dynamiquement <code>PWD</code> et{" "}
                  <code>OLDPWD</code> dans l'environnement.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">pwd</td>
                <td className="py-2">
                  Récupère et affiche le chemin absolu du répertoire de
                  travail courant.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">export</td>
                <td className="py-2">
                  Sans argument, affiche l'environnement trié par ordre
                  alphabétique. Avec arguments, valide la clé (
                  <code>is_valid_identifier</code>) et insère/modifie la
                  variable dans <code>t_env</code>.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">unset</td>
                <td className="py-2">
                  Supprime une ou plusieurs variables d'environnement de la
                  structure <code>t_env</code>.
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono">env</td>
                <td className="py-2">
                  Affiche l'intégralité des variables d'environnement
                  actuelles.
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono">exit</td>
                <td className="py-2">
                  Quitte le shell. Analyse l'argument numérique avec{" "}
                  <code>ft_strtoll()</code> (gestion des dépassements{" "}
                  <code>LLONG_MAX</code>/<code>LLONG_MIN</code>). Libère
                  toute la mémoire avant la sortie (
                  <code>clean_and_exit</code>).
                </td>
              </tr>
            </tbody>
          </table>
        </InfoCard>

        <InfoCard title="Gestion des signaux & variable globale">
          <p className="mb-4">
            Conformément au sujet, une seule variable globale est présente
            dans tout le projet :{" "}
            <code>volatile sig_atomic_t g_signal</code>. Elle sert
            uniquement à véhiculer l'information d'une interruption.
          </p>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="text-white">Mode interactif (prompt) :</strong>{" "}
              <code>Ctrl-C</code> (SIGINT) affiche <code>^C</code>, saute une
              ligne, réinitialise la ligne de saisie (
              <code>rl_replace_line</code>, <code>rl_redisplay</code>) et met{" "}
              <code>last_exit_status</code> à 130. <code>Ctrl-\</code>{" "}
              (SIGQUIT) est ignoré (<code>SIG_IGN</code>). <code>Ctrl-D</code>{" "}
              est détecté par <code>readline()</code> qui renvoie{" "}
              <code>NULL</code>, entraînant une sortie propre du shell.
            </li>
            <li>
              <strong className="text-white">Pendant un heredoc :</strong>{" "}
              <code>Ctrl-C</code> est intercepté par un crochet{" "}
              <code>rl_event_hook</code>, qui ferme la saisie du heredoc en
              cours et redonne la main au prompt proprement sans faire
              planter le programme.
            </li>
            <li>
              <strong className="text-white">Dans les processus enfants :</strong>{" "}
              les signaux sont réinitialisés à leur comportement par défaut
              (<code>SIG_DFL</code>) juste après le <code>fork()</code>, afin
              que les binaires appelés par <code>execve</code> réagissent
              normalement aux interruptions.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Gestion mémoire & chasse aux leaks">
          <p className="mb-4">
            Une attention particulière a été apportée à la gestion de la
            mémoire. À chaque fin de cycle (après l'exécution d'une ligne) :
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <code>free_tokens()</code> libère l'intégralité de la liste
              lexicale.
            </li>
            <li>
              <code>free_pipeline()</code> libère les structures de
              commandes, les arguments et les redirections.
            </li>
            <li>
              <code>clean_and_exit()</code> libère la structure globale{" "}
              <code>t_shell</code> et l'environnement dupliqué en cas de
              fermeture.
            </li>
            <li>
              <code>safe_close()</code> garantit qu'aucun descripteur de
              fichier ne reste ouvert.
            </li>
          </ul>
          <p className="mt-4">
            Le projet passe l'outil Valgrind avec zéro fuite mémoire. Un
            fichier de suppression <code>valgrind.supp</code> est utilisé
            uniquement pour filtrer les fuites internes connues de la
            bibliothèque externe readline.
          </p>
        </InfoCard>

        <p>
        À présent, je vous invite à tester les commandes que vous souhaitez à travers le terminal virtuel qui s'exécutera juste en dessous via le bouton tester.
        </p>

        {project.repoUrl && (
          <div className="mt-16 mb-16 flex justify-center">
            <ShinyButton onClick={() => setShowSandbox(true)} backgroundColor="#333333">
              Tester
            </ShinyButton>
          </div>
        )}

        {showSandbox && <SandboxModal projectId={project.id} onClose={() => setShowSandbox(false)} variant="terminal"/>}

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/50">
          <p className="mb-3 font-black text-white/70">Documents</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Bash Reference Manual</li>
            <li>The Open Group — Shell &amp; Utilities</li>
            <li>
              <a
                href="https://github.com/Xasiyy/minishell.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 underline hover:text-violet-300"
              >
                github.com/Xasiyy/minishell
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
        <p className="mb-3 font-black text-white/70">Dépôt du projet</p>
        <a
          href="https://github.com/Xasiyy/minishell"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 py-3 pl-4 pr-5 shadow-lg backdrop-blur-md transition hover:border-white/20"
          style={{ backgroundColor: "#333333" }}
        >
          <svg viewBox="0 0 16 16" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">minishell</span>
            <span className="text-xs text-white/50 transition group-hover:text-violet-300">
              Voir le projet sur GitHub ↗
            </span>
          </div>
        </a>

      </main>
    </div>
  );
}
