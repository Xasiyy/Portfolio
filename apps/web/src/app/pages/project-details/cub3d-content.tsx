import raycasting1 from "@/app/projects/cub3d/img/raycasting1.jpg";
import raycasting2 from "@/app/projects/cub3d/img/raycasting2.jpg";
import raycasting3 from "@/app/projects/cub3d/img/raycasting3.jpg";

const imgClass = "mx-auto max-w-md rounded-lg border border-white/10";

export function Cub3DContentFr() {
  return (
    <>
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

      <img src={raycasting1.src} alt="Schéma du calcul du vecteur direction et plan caméra" className={imgClass} />

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

      <img src={raycasting2.src} alt="Schéma de la correction de l'effet fish-eye" className={imgClass} />

      <p>Ensuite, on passe de la 2D à la 3D avec le théorème de Thalès et la perspective.</p>

      <img src={raycasting3.src} alt="Schéma du passage 2D vers 3D via le théorème de Thalès" className={imgClass} />

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
    </>
  );
}

export function Cub3DContentEn() {
  return (
    <>
      <p>
        This project is a first-person pseudo-3D graphics engine written in C using the
        MiniLibX. Its goal is to understand and recreate the basics of raycasting, relying on
        fundamental mathematical principles (trigonometry, vectors, spatial geometry).
      </p>

      <p>
        First, let's clarify what the MiniLibX, more commonly called MLX, is. It is a small,
        minimal graphics library in C developed specifically for 42 students. It was designed
        to offer a simplified interface for displaying graphics and opening a window without
        having to deal directly with the very complex graphics APIs of operating systems. The
        MLX mainly saves students from losing time on the internals of windowing systems, so
        they can focus fully on the code and the project itself. Although it brings a lot of
        simplicity, it is also deliberately very basic, with no complex "magic" functions: it
        forces us to write our own graphics engine. That is what led us to code the raycasting
        in this project.
      </p>

      <p>
        If I speak in the plural, it is because there were two of us on this project. We
        worked as a pair on the entire project, taking care to split the tasks and to
        understand all of each other's code.
      </p>

      <p>
        The work split up naturally: I focused on the mathematical side while my teammate
        worked on the graphics side to deliver the best possible visuals. The engine draws
        directly on grid intersection methods, largely inspired by the developer 3DSage, whose
        video and GitHub are linked at the end of this article.
      </p>

      <p>
        To build this project without getting lost, I worked in stages. I started with a 2D map
        containing a minimap and my player. Then I drew the rays in 2D to check that they hit
        the walls correctly. Only once this step was validated did I move on to the 3D
        projection.
      </p>

      <p>
        3DSage made a series of videos in which he explains how to go from a 2D map to a
        first-person pseudo-3D render without using real 3D, only with raycasting (video link
        at the bottom of the page).
      </p>

      <p>
        Building on his reasoning, I managed to reach a similar mathematical result. Raycasting
        relies on a simple idea: casting rays from my player to measure the distance to the
        first obstacle, then using that distance to determine the height of the line of pixels
        to draw.
      </p>

      <p>
        To do this, we create a direction vector (where the player is looking) and a camera
        plane vector (perpendicular to the direction, which defines the width of the field of
        view). Then, for each pixel column x of the screen (from 0 to{" "}
        <code>SCREEN_WIDTH</code>), we compute its position on a scale from -1 (left edge) to
        +1 (right edge).
      </p>

      <img src={raycasting1.src} alt="Diagram of the direction vector and camera plane calculation" className={imgClass} />

      <p>
        Instead of moving forward pixel by pixel, we use sin and cos to calculate the distance
        needed to cross exactly one grid cell in X or in Y.
      </p>

      <p>
        We look at the last step of the DDA algorithm (was it a vertical step in X or a
        horizontal step in Y?) combined with the direction of the ray. Because the rays cast
        toward the edges of the screen are longer than the one in the center, a flat wall would
        look curved: this is the <em>fish-eye</em> effect. Multiplying by the cosine gives the
        distance perpendicular to the screen plane, which makes the walls perfectly straight.
      </p>

      <img src={raycasting2.src} alt="Diagram of the fish-eye effect correction" className={imgClass} />

      <p>Next, we go from 2D to 3D using the intercept theorem (Thales's theorem) and perspective.</p>

      <img src={raycasting3.src} alt="Diagram of the 2D to 3D transition using Thales's theorem" className={imgClass} />

      <p>
        This is the rule of linear perspective: the farther away an object is, the smaller it
        appears on screen. We calculate the exact height of the pixel column to fill in the
        middle of the screen; the rest becomes the floor and the ceiling.
      </p>

      <p>
        Finally, to map the .xpm textures, we find the exact point of impact on the cell to
        extract the right column of the image. During implementation, I noticed a mirror effect
        on some faces: the images appeared reversed. I fixed this by identifying the
        orientation of the wall (especially South and West) to invert the direction in which the
        texture is read. It was one of my biggest bugs (or at least the most baffling one), and
        it took me a long time to understand because of its still mysterious origin...
      </p>

      <p>
        I invite you to try the code by clicking the button just below. Use the "W A S D" keys
        to move and the arrow keys to turn your view.
      </p>
    </>
  );
}
