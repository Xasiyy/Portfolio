import { CatAvatar } from "@/components/cat-avatar";

export function AboutMe() {
  const skillGroups = [
    {
      title: "Compétences techniques",
      items: ["C/C++", "Typescript/Javascript", "NodeJs", "Python", "SQL, Database management"],
    },
    {
      title: "Savoir-être",
      items: ["Autonomie", "Organisation", "Prise d'initiative", "Adaptation"],
    },
    {
      title: "Centres d'intérêt",
      items: ["Lectures diverses", "Techs", "Sport automobile"],
    },
  ];

  return (
    <div className="relative min-h-screen bg-[url('/bg.jpeg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen flex-col gap-10 px-[10px] pt-32 pb-16 text-white lg:flex-row lg:gap-10">
        <aside className="flex flex-col items-center gap-8 pl-[70px] pr-[120px] lg:w-[28%] lg:items-start lg:self-start">
         <CatAvatar />


          <div className="flex w-full flex-col gap-6">
            {skillGroups.map((group) => (
              <div key={group.title} className="flex w-full flex-col gap-3">
                <h2 className="font-serif text-lg">{group.title}</h2>
                <ul className="flex flex-wrap gap-2 lg:flex-col">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex w-full flex-1 flex-col mr-[200px] mt-[20px] lg:justify-center">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
            <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-6xl">
              Hello, moi c&apos;est Asiya !
            </h1>
            <p className="text-lg text-white/80">
              Je m’appelle Asiya Ajili Diallo, je suis développeuse et actuellement étudante à l’École 42 Mulhouse. Mon parcours, axé sur l’autonomie et le dépassement de soi, m’a forgé un profil atypique : j’ai effectué toute ma scolarité à domicile et décroché mon baccalauréat général en candidate libre. Cette organisation sur-mesure m’a permis de mener de front mes études et mes premiers projets informatiques. Grâce à cette méthode de travail rigoureuse et intensive, j’ai développé une capacité d’adaptation : j’apprends vite, sais m’organiser efficacement et respecte scrupuleusement les échéances.

             À l’École 42, j’ai retrouvé cette même dynamique basée sur le peer-learning et la gestion de projets sous contrainte de temps. Au-delà de l’aspect technique, le côté humain et collectif m’a immédiatement stimulée : très investie dans la vie du campus, j’ai rejoint le BDE et fondé ma propre association afin d’accompagner les étudiants dans la création de leurs clubs et d’alimenter la vie associative de l'école. Mon parcours m'a ainsi permis de développer une forte autonomie tout en excellant dans le travail en équipe.


            </p>
            <p className="text-lg text-white/80">
            Forte de ce parcours, j’ai développé une solide culture technique et une grande polyvalence. Après une spécialité Mathématiques et NSI au lycée — qui m'a ancrée dans la logique algorithmique et les fondamentaux de la programmation —, j’ai rejoint l’École 42. J'y ai consolidé mes bases à travers un tronc commun exigeant centré sur le C et le C++, avant de me tourner vers ma spécialisation actuelle : l'IA, le Software Engineering et le Backend.

            Aujourd'hui en préparation du diplôme RNCP Niveau 7 (équivalent Bac+5), je conçois des algorithmes complexes, crée et intègre des modèles LLM et développe des architectures backend robustes. Ma polyvalence me permet d'intervenir aussi bien sur des problématiques d'IA que sur des projets Fullstack, en concevant des applications de A à Z (développement, mise en production et maintenance).

            Que ce soit pour aider une startup à concevoir des technologies innovantes ou m'investir au sein d'une grande équipe, je mets mes compétences techniques et mon adaptabilité au service de vos défis.

            Envie de voir ce que je sais faire ? Ce portfolio est interactif ! Vous pouvez non seulement consulter le détail de mes réalisations, mais aussi lancer certains projets directement au sein d'un conteneur pour les tester en temps réel. Rendez-vous dans la section Projets pour découvrir mes accomplissements !
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

