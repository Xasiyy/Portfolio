import { InfoCard } from "@/components/info-card";

export function MinishellContentFr() {
  return (
    <>
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
    </>
  );
}
export function MinishellContentEn() {
  return (
    <>
      <div className="space-y-6 leading-relaxed">
        <p>
          Minishell is a major project of the 42 curriculum whose goal is to
          recreate a functional, robust Unix shell inspired by Bash. The
          program displays a prompt, manages history with the readline
          library, parses complex command lines and executes binaries
          through <code>execve</code> or through builtins reimplemented by
          hand.
        </p>

        <p>
          Although it is a pair project, the entire architecture (parsing,
          execution pipeline, memory and signal management) was designed and
          coded in a centralized way to ensure perfect consistency and
          guarantee zero memory leaks (except for readline's tolerated
          internal leaks). Because of problems encountered during the
          curriculum, my teammate had to step in at the end of the project —
          he fixed a huge number of bugs and leaks, without which the
          project would not have been completed.
        </p>

        <p>
          The project complies 100% with the 42 Norm and uses only one
          global variable (<code>g_signal</code>, which made the task much
          harder), strictly reserved for receiving signals.
        </p>
      </div>

      <InfoCard title="Project architecture">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`minishell/
├── include/
│   └── minishell.h          # Global structures & prototypes
├── src/
│   ├── main/
│   │   └── main.c           # Entry point, t_shell init
│   ├── shell_main/
│   │   └── shell_main.c     # Main readline loop
│   ├── line_handler/
│   │   └── line_handler.c   # Orchestrates line processing
│   ├── parsing/              # Lexer, Expander, Splitter & Syntax Check
│   ├── execution/             # Fork, Execve, Pipes & Redirections
│   ├── builtins/               # The 7 builtins + Heredoc
│   ├── env/                     # Dynamic environment management
│   ├── signal/                   # SIGINT / SIGQUIT handlers
│   └── free/                      # Memory cleanup & FD closing
├── libft/                    # Personal C library
├── ft_printf/                 # printf implementation
└── get_next_line/              # Line-by-line reading`}
        </pre>
      </InfoCard>

      <InfoCard title="Execution flow & how it works">
        <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-white/70">
{`main()
  ↓
start_shell_loop()
  ↓
readline()  ──►  "cmd1 | cmd2 > file.txt"  ──►  add_history()
  ↓
handle_line()
  ├── lexer()                 ──►  Split into a list of t_token
  ├── split_pipeline_tokens() ──►  Split on pipes '|'
  ├── parse_all_pipelines()   ──►  Expansion ($VAR) + building t_command & t_redir
  └── execute_all_pipelines()
        ├── Simple pipeline   ──►  execute_single_command() (parent builtin / execve)
        └── Complex pipeline  ──►  execute_pipeline() (pipes, fork, dup2, waitpid)
  ↓
free_all() & back to the prompt`}
        </pre>
      </InfoCard>

      <div className="space-y-6 leading-relaxed">
        <p>
          <strong className="text-white">Parsing phase.</strong> Parsing
          turns a raw string into an unambiguous, usable data structure. The
          lexer walks through the line character by character and generates
          a linked list of{" "}
          <code>t_token</code>. Each token keeps track of its type and of its
          level of quote protection: single quotes fully protect their
          content (no variable expansion), while double quotes protect
          spaces and operators but allow expansion with{" "}
          <code>$</code>. Before any heavy processing, the syntax is
          checked: the shell immediately rejects invalid commands with an
          exit code of 2.
        </p>

        <p>
          <strong className="text-white">
            Execution and redirections.
          </strong>{" "}
          For simple commands, if the command is a builtin that must modify
          the parent's environment (<code>cd</code>,{" "}
          <code>exit</code>, <code>export</code>, <code>unset</code>), it
          runs in the parent process without any fork. If it is an external
          binary or a builtin with a redirection, a fork is created. For a
          pipeline of N commands connected by pipes, N − 1 pipes are created
          with <code>pipe()</code>. Each command is launched in a child
          process with <code>fork()</code>: the write end of the previous
          pipe is duplicated onto{" "}
          <code>STDIN_FILENO</code> and the input of the next one onto{" "}
          <code>STDOUT_FILENO</code> with <code>dup2()</code>. All unused
          FDs are closed to avoid deadlocks, and the parent waits for all
          the children with <code>waitpid()</code>.
        </p>

        <p>
          Redirections are handled in{" "}
          <code>handle_redirections()</code>: <code>&lt;</code> opens with{" "}
          <code>O_RDONLY</code> then <code>dup2(fd, STDIN_FILENO)</code>;{" "}
          <code>&gt;</code> opens with{" "}
          <code>O_WRONLY | O_CREAT | O_TRUNC</code> then{" "}
          <code>dup2(fd, STDOUT_FILENO)</code>;{" "}
          <code>&gt;&gt;</code> opens with{" "}
          <code>O_WRONLY | O_CREAT | O_APPEND</code> then{" "}
          <code>dup2(fd, STDOUT_FILENO)</code>. The heredoc (
          <code>&lt;&lt;</code>) creates a unique temporary file in{" "}
          <code>/tmp/minishell_heredoc_PID</code>, reads the input with{" "}
          <code>readline("&gt; ")</code> until the delimiter, applies
          variable expansion to it (unless the delimiter was quoted), then
          injects that file into <code>STDIN_FILENO</code>. The file is
          removed from the disk as soon as it is opened thanks to{" "}
          <code>unlink()</code>.
        </p>
      </div>

      <InfoCard title="Implemented builtins">
        <p className="mb-4 text-sm text-white/70">
          All the builtins were rewritten by hand, without any external
          system call.
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white">
              <th className="py-2 pr-4 font-serif">Builtin</th>
              <th className="py-2 font-serif">
                Description & technical implementation
              </th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">echo</td>
              <td className="py-2">
                Prints its arguments to stdout. Handles the{" "}
                <code>-n</code> option (removes the trailing newline).
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">cd</td>
              <td className="py-2">
                Changes the current directory with <code>chdir()</code>.
                Dynamically updates <code>PWD</code> and{" "}
                <code>OLDPWD</code> in the environment.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">pwd</td>
              <td className="py-2">
                Gets and prints the absolute path of the current working
                directory.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">export</td>
              <td className="py-2">
                Without arguments, prints the environment sorted
                alphabetically. With arguments, validates the key (
                <code>is_valid_identifier</code>) and inserts/updates the
                variable in <code>t_env</code>.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">unset</td>
              <td className="py-2">
                Removes one or more environment variables from the{" "}
                <code>t_env</code> structure.
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono">env</td>
              <td className="py-2">
                Prints all the current environment variables.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">exit</td>
              <td className="py-2">
                Exits the shell. Parses the numeric argument with{" "}
                <code>ft_strtoll()</code> (handling{" "}
                <code>LLONG_MAX</code>/<code>LLONG_MIN</code> overflows).
                Frees all the memory before exiting (
                <code>clean_and_exit</code>).
              </td>
            </tr>
          </tbody>
        </table>
      </InfoCard>

      <InfoCard title="Signal handling & global variable">
        <p className="mb-4">
          As required by the subject, the whole project contains a single
          global variable:{" "}
          <code>volatile sig_atomic_t g_signal</code>. Its only purpose is
          to carry the information that an interruption occurred.
        </p>
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-white">Interactive mode (prompt):</strong>{" "}
            <code>Ctrl-C</code> (SIGINT) prints <code>^C</code>, moves to a
            new line, resets the input line (
            <code>rl_replace_line</code>, <code>rl_redisplay</code>) and sets{" "}
            <code>last_exit_status</code> to 130. <code>Ctrl-\</code>{" "}
            (SIGQUIT) is ignored (<code>SIG_IGN</code>). <code>Ctrl-D</code>{" "}
            is detected by <code>readline()</code>, which returns{" "}
            <code>NULL</code>, leading to a clean exit of the shell.
          </li>
          <li>
            <strong className="text-white">During a heredoc:</strong>{" "}
            <code>Ctrl-C</code> is caught by an{" "}
            <code>rl_event_hook</code>, which closes the current heredoc
            input and cleanly hands control back to the prompt without
            crashing the program.
          </li>
          <li>
            <strong className="text-white">In child processes:</strong>{" "}
            signals are reset to their default behavior
            (<code>SIG_DFL</code>) right after <code>fork()</code>, so that
            the binaries called by <code>execve</code> react normally to
            interruptions.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Memory management & leak hunting">
        <p className="mb-4">
          Particular care was taken with memory management. At the end of
          each cycle (after a line has been executed):
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>free_tokens()</code> frees the entire lexical list.
          </li>
          <li>
            <code>free_pipeline()</code> frees the command structures, the
            arguments and the redirections.
          </li>
          <li>
            <code>clean_and_exit()</code> frees the global{" "}
            <code>t_shell</code> structure and the duplicated environment
            on exit.
          </li>
          <li>
            <code>safe_close()</code> ensures that no file descriptor is
            left open.
          </li>
        </ul>
        <p className="mt-4">
          The project passes Valgrind with zero memory leaks. A{" "}
          <code>valgrind.supp</code> suppression file is used only to filter
          out the known internal leaks of the external readline library.
        </p>
      </InfoCard>

      <p>
        Now, I invite you to try any commands you like in the virtual terminal that will open just below when you click the Try it button.
      </p>
    </>
  );
}
