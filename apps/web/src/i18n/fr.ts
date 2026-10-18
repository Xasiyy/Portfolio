export const fr = {
  nav: { about: "À propos", projects: "Projets", contact: "Contact" },
  home: {
    title: "Bienvenue dans mon portfolio !",
    intro: "Vous avez une idée audacieuse à concrétiser ? Je mets mon expertise en développement au service des projets les plus innovants pour leur donner vie. Découvrez mon profil complet via le bouton juste en dessous.",
    cta: "À propos de moi",
  },
    about: {
    title: "Hello, moi c'est Asiya !",
    skillGroups: [
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
    ],
    paragraphs: [
      "Je m’appelle Asiya Ajili Diallo, je suis développeuse et actuellement étudante à l’École 42 Mulhouse. Mon parcours, axé sur l’autonomie et le dépassement de soi, m’a forgé un profil atypique : j’ai effectué toute ma scolarité à domicile et décroché mon baccalauréat général en candidate libre. Cette organisation sur-mesure m’a permis de mener de front mes études et mes premiers projets informatiques. Grâce à cette méthode de travail rigoureuse et intensive, j’ai développé une capacité d’adaptation : j’apprends vite, sais m’organiser efficacement et respecte scrupuleusement les échéances. À l’École 42, j’ai retrouvé cette même dynamique basée sur le peer-learning et la gestion de projets sous contrainte de temps. Au-delà de l’aspect technique, le côté humain et collectif m’a immédiatement stimulée : très investie dans la vie du campus, j’ai rejoint le BDE et fondé ma propre association afin d’accompagner les étudiants dans la création de leurs clubs et d’alimenter la vie associative de l'école. Mon parcours m'a ainsi permis de développer une forte autonomie tout en excellant dans le travail en équipe.",
      "Forte de ce parcours, j’ai développé une solide culture technique et une grande polyvalence. Après une spécialité Mathématiques et NSI au lycée — qui m'a ancrée dans la logique algorithmique et les fondamentaux de la programmation —, j’ai rejoint l’École 42. J'y ai consolidé mes bases à travers un tronc commun exigeant centré sur le C et le C++, avant de me tourner vers ma spécialisation actuelle : l'IA, le Software Engineering et le Backend. Aujourd'hui en préparation du diplôme RNCP Niveau 7 (équivalent Bac+5), je conçois des algorithmes complexes, crée et intègre des modèles LLM et développe des architectures backend robustes. Ma polyvalence me permet d'intervenir aussi bien sur des problématiques d'IA que sur des projets Fullstack, en concevant des applications de A à Z (développement, mise en production et maintenance). Que ce soit pour aider une startup à concevoir des technologies innovantes ou m'investir au sein d'une grande équipe, je mets mes compétences techniques et mon adaptabilité au service de vos défis. Envie de voir ce que je sais faire ? Ce portfolio est interactif ! Vous pouvez non seulement consulter le détail de mes réalisations, mais aussi lancer certains projets directement au sein d'un conteneur pour les tester en temps réel. Rendez-vous dans la section Projets pour découvrir mes accomplissements !",
    ],
  },

  common: { loading: "Chargement…", backToProjects: "Retour aux projets" },
  errors: {
    loadProjects: "Impossible de charger les projets",
    rateLimited: "Trop de messages envoyés, réessayez dans une heure.",
    sendFailed: "L'envoi a échoué, réessayez plus tard.",
  },
  projects: { title: "Mes projets" },
    projectPage: {
    visitSite: "Aller sur le site",
    test: "Tester",
    documents: "Documents",
    collaborators: "Collaborateurs",
    repository: "Dépôt du projet",
    viewOnGithub: "Voir le projet sur GitHub ↗",
  },
  sandbox: {
    rateLimited: "Vous avez lancé beaucoup de tests en peu de temps. Réessayez d'ici une dizaine de minutes.",
    full: "Tous les environnements de test sont occupés pour le moment. Réessayez dans quelques minutes.",
    close: "Fermer",
    retry: "Réessayer",
    launchFailed: "Impossible de lancer le sandbox",
    compiling: "Compilation et lancement en cours, ça peut prendre jusqu'à une minute…",
    startingTerminal: "Démarrage du terminal…",
    startingDisplay: "Démarrage de l'affichage…",
  },
  contact: {
    title: "Me contacter",
    intro: "Une question, une opportunité ou juste envie d'échanger ? Laissez-moi un message, je vous réponds rapidement.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    emailPlaceholder: "vous@exemple.com",
    message: "Votre message",
    messagePlaceholder: "Parlez-moi de votre projet ou posez moi vos toutes vos questions.",
    sending: "Envoi…",
    send: "Envoyer le message",
    sent: "Message envoyé, merci ! Je vous réponds très vite.",
    responseTime: "Réponse sous 24 à 48 h",
    privacy: "Votre message n'est jamais partagé",
  },
};

export type Dictionary = typeof fr;
