// Interface strings for the notice and reviewer mode, per target language.
// Languages without an entry use English. Placeholders: {src} source language
// name, {lang} the page's language, {names} a list of people, {n} a count.
// Strings with a count may give a singular and a plural form, `one||other`.

export interface UiStrings {
  bannerLabel: string;
  translatedFrom: string;
  untranslated: string;
  state_untranslated: string;
  state_machine: string;
  state_partial: string;
  state_reviewed: string;
  state_human: string;
  readOriginal: string;
  segHuman: string;
  segVerified: string;
  segMachine: string;
  segAllMachine: string;
  segFallback: string;
  thanks: string;
  credit: string;
  others: string;
  nobody: string;
  ctaFirstTitle: string;
  ctaFirstBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaHumanTitle: string;
  ctaHumanBody: string;
  reviewTranslation: string;
  improveTranslation: string;
  reviewThanks: string;
  reviewOn: string;
  reviewHow: string;
  reviewPr: string;
  reviewGuide: string;
  exitReview: string;
  source: string;
  translation: string;
  reviewedBy: string;
  notReviewed: string;
  approve: string;
  suggest: string;
  cancel: string;
  save: string;
  pending: string;
  submit: string;
  submitNote: string;
  submitting: string;
  trayTitle: string;
  trayHere: string;
  trayOther: string;
  trayPages: string;
  countApproved: string;
  countImproved: string;
  clear: string;
  thisPage: string;
  clearAll: string;
  clearAllConfirm: string;
  signIn: string;
  signInWhy: string;
  signedInAs: string;
  signOut: string;
  signInDenied: string;
  status_missing: string;
  status_stale: string;
  status_machine: string;
  status_reviewed: string;
  previous: string;
  code: string;
  submitted: string;
  submittedThanks: string;
  submittedBody: string;
  viewOnGitHub: string;
  keepReviewing: string;
  held: string;
  heldOne: string;
  retry: string;
  discardHeld: string;
  discardHeldConfirm: string;
  submitFailed: string;
  kept: string;
  noStorage: string;
  close: string;
  languages: string;
}

const en: UiStrings = {
  bannerLabel: 'About this translation',
  translatedFrom: 'Translated from {src}',
  untranslated: 'This page has not been translated yet and is shown in {src}.',
  state_untranslated: 'Not translated yet',
  state_machine: 'Machine translated',
  state_partial: 'Partly reviewed by people',
  state_reviewed: 'Reviewed by people',
  state_human: 'Human translated and reviewed',
  readOriginal: 'Read the original',
  segHuman: '{n} human translated',
  segVerified: '{n} machine translated, verified by people',
  segMachine: '{n} machine translated, not yet reviewed',
  segAllMachine: 'The paragraph is machine translated||All {n} paragraphs machine translated',
  segFallback: '{n} not yet translated',
  thanks: 'With thanks to {names} for helping with this page.',
  credit: 'Translated and reviewed by {names}. Thank you all.',
  others: '{n} other||{n} others',
  nobody: 'No one has reviewed this page yet. Help review the translation and be credited here.',
  ctaFirstTitle: 'Read {lang}? Be the first to help.',
  ctaFirstBody: 'Even approving a few paragraphs that read well tells future readers they can trust them.',
  ctaTitle: 'Read {lang}? We’d love your help.',
  ctaBody: 'Approve a paragraph or suggest a better translation. Each one helps every reader after you.',
  ctaHumanTitle: 'Found a problem others missed?',
  ctaHumanBody: 'Suggest a better translation. Suggestions are warmly welcomed.',
  reviewTranslation: 'Review the translation',
  improveTranslation: 'Improve the translation',
  reviewThanks: 'Thank you for reviewing, {login}!',
  reviewOn: 'You’re reviewing this page.',
  reviewHow: 'Select a paragraph to approve it or suggest a better translation.',
  reviewPr: 'Your changes become a pull request from your GitHub account.',
  reviewGuide: 'How reviewing works',
  exitReview: 'Leave review mode',
  source: 'Original',
  translation: 'Translation',
  reviewedBy: 'Reviewed by',
  notReviewed: 'Not reviewed yet',
  approve: 'Approve',
  suggest: 'Suggest an edit',
  cancel: 'Cancel',
  save: 'Save suggestion',
  pending: '{n} pending',
  submit: 'Submit your review as a pull request',
  submitNote: 'Opens a pull request from your account.',
  submitting: 'Opening a pull request…',
  trayTitle: 'Your review',
  trayHere: '{n} change on this page||{n} changes on this page',
  trayOther: '{n} change on another page||{n} changes on another page',
  trayPages: '{n} changes on {p} pages',
  countApproved: '{n} approved',
  countImproved: '{n} better translation||{n} better translations',
  clear: 'Discard',
  thisPage: 'This page',
  clearAll: 'Discard all',
  clearAllConfirm: 'Discard all {n} pending changes on {p} pages?',
  signIn: 'Sign in with GitHub',
  signInWhy: 'Your review is proposed as a pull request under your GitHub account.',
  signedInAs: 'Signed in as {login}',
  signOut: 'Sign out',
  signInDenied: 'GitHub sign-in was cancelled.',
  status_missing: 'Not translated: original text shown',
  status_stale: 'Original changed: original text shown',
  status_machine: 'Machine translation, not reviewed',
  status_reviewed: 'Reviewed by {n}',
  previous: 'Previous translation',
  code: 'Code',
  submitted: 'Pull request opened',
  submittedThanks: 'Thank you, {login}!',
  submittedBody: 'Your changes are in pull request {pr}. Your name appears in the banner once it’s merged.',
  viewOnGitHub: 'View on GitHub',
  keepReviewing: 'Keep reviewing',
  held: '{n} not submitted',
  heldOne: 'Not submitted',
  retry: 'Try again',
  discardHeld: 'Discard these',
  discardHeldConfirm: 'Discard {n} changes that were not submitted?',
  submitFailed: 'Could not submit',
  kept: 'Your changes are kept; try again later',
  noStorage: 'This browser is not saving your changes. Submit them before leaving this page.',
  close: 'Close',
  languages: 'Languages',
};

const fr: UiStrings = {
  bannerLabel: 'À propos de cette traduction',
  translatedFrom: 'Traduit de l’{src}',
  untranslated: 'Cette page n’a pas encore été traduite et s’affiche en {src}.',
  state_untranslated: 'Pas encore traduite',
  state_machine: 'Traduction automatique',
  state_partial: 'Relue en partie par des personnes',
  state_reviewed: 'Relue par des personnes',
  state_human: 'Traduite et relue par des personnes',
  readOriginal: 'Lire l’original',
  segHuman: '{n} traduit par des personnes||{n} traduits par des personnes',
  segVerified: '{n} traduit automatiquement, vérifié par des personnes||{n} traduits automatiquement, vérifiés par des personnes',
  segMachine: '{n} traduit automatiquement, pas encore relu||{n} traduits automatiquement, pas encore relus',
  segAllMachine: 'Le paragraphe est traduit automatiquement||Les {n} paragraphes traduits automatiquement',
  segFallback: '{n} pas encore traduit||{n} pas encore traduits',
  thanks: 'Merci à {names} pour l’aide apportée à cette page.',
  credit: 'Traduite et relue par {names}. Merci à tous.',
  others: '{n} autre personne||{n} autres personnes',
  nobody: 'Personne n’a encore relu cette page. Aidez à relire la traduction et votre nom apparaîtra ici.',
  ctaFirstTitle: 'Vous lisez le {lang} ? Soyez la première personne à aider.',
  ctaFirstBody: 'Approuver quelques paragraphes qui se lisent bien indique déjà aux prochains lecteurs qu’ils peuvent s’y fier.',
  ctaTitle: 'Vous lisez le {lang} ? Votre aide serait précieuse.',
  ctaBody: 'Approuvez un paragraphe ou proposez une meilleure traduction. Chaque contribution aide tous les lecteurs suivants.',
  ctaHumanTitle: 'Vous avez repéré un problème qui a échappé aux autres ?',
  ctaHumanBody: 'Proposez une meilleure traduction. Les suggestions sont toujours les bienvenues.',
  reviewTranslation: 'Relire la traduction',
  improveTranslation: 'Améliorer la traduction',
  reviewThanks: 'Merci de votre relecture, {login} !',
  reviewOn: 'Vous relisez cette page.',
  reviewHow: 'Sélectionnez un paragraphe pour l’approuver ou proposer une meilleure traduction.',
  reviewPr: 'Vos modifications deviennent une pull request depuis votre compte GitHub.',
  reviewGuide: 'Comment fonctionne la relecture',
  exitReview: 'Quitter la relecture',
  source: 'Original',
  translation: 'Traduction',
  reviewedBy: 'Relu par',
  notReviewed: 'Pas encore relu',
  approve: 'Approuver',
  suggest: 'Proposer une modification',
  cancel: 'Annuler',
  save: 'Enregistrer la proposition',
  pending: '{n} en attente',
  submit: 'Soumettre votre relecture en pull request',
  submitNote: 'Ouvre une pull request depuis votre compte.',
  submitting: 'Ouverture de la pull request…',
  trayTitle: 'Votre relecture',
  trayHere: '{n} modification sur cette page||{n} modifications sur cette page',
  trayOther: '{n} modification sur une autre page||{n} modifications sur une autre page',
  trayPages: '{n} modifications sur {p} pages',
  countApproved: '{n} approuvé||{n} approuvés',
  countImproved: '{n} meilleure traduction||{n} meilleures traductions',
  clear: 'Abandonner',
  thisPage: 'Cette page',
  clearAll: 'Tout abandonner',
  clearAllConfirm: 'Abandonner les {n} modifications en attente sur {p} pages ?',
  signIn: 'Se connecter avec GitHub',
  signInWhy: 'Votre relecture est proposée en pull request depuis votre compte GitHub.',
  signedInAs: 'Connecté en tant que {login}',
  signOut: 'Se déconnecter',
  signInDenied: 'La connexion à GitHub a été annulée.',
  status_missing: 'Non traduit : texte original affiché',
  status_stale: 'Original modifié : texte original affiché',
  status_machine: 'Traduction automatique, non relue',
  status_reviewed: 'Relu par {n}',
  previous: 'Traduction précédente',
  code: 'Code',
  submitted: 'Pull request ouverte',
  submittedThanks: 'Merci, {login} !',
  submittedBody: 'Vos modifications sont dans la pull request {pr}. Votre nom apparaîtra dans le bandeau une fois qu’elle sera fusionnée.',
  viewOnGitHub: 'Voir sur GitHub',
  keepReviewing: 'Continuer la relecture',
  held: '{n} non soumises',
  heldOne: 'Non soumise',
  retry: 'Réessayer',
  discardHeld: 'Les abandonner',
  discardHeldConfirm: 'Abandonner les {n} modifications non soumises ?',
  submitFailed: 'Échec de l’envoi',
  kept: 'Vos modifications sont conservées ; réessayez plus tard',
  noStorage: 'Ce navigateur n’enregistre pas vos modifications. Soumettez-les avant de quitter cette page.',
  close: 'Fermer',
  languages: 'Langues',
};

const es: UiStrings = {
  bannerLabel: 'Sobre esta traducción',
  translatedFrom: 'Traducido del {src}',
  untranslated: 'Esta página aún no está traducida y se muestra en {src}.',
  state_untranslated: 'Sin traducir todavía',
  state_machine: 'Traducción automática',
  state_partial: 'Revisada en parte por personas',
  state_reviewed: 'Revisada por personas',
  state_human: 'Traducida y revisada por personas',
  readOriginal: 'Leer el original',
  segHuman: '{n} traducido por personas||{n} traducidos por personas',
  segVerified: '{n} traducido automáticamente, verificado por personas||{n} traducidos automáticamente, verificados por personas',
  segMachine: '{n} traducido automáticamente, sin revisar||{n} traducidos automáticamente, sin revisar',
  segAllMachine: 'El párrafo está traducido automáticamente||Los {n} párrafos traducidos automáticamente',
  segFallback: '{n} sin traducir todavía',
  thanks: 'Gracias a {names} por ayudar con esta página.',
  credit: 'Traducida y revisada por {names}. ¡Gracias a todos!',
  others: '{n} persona más||{n} personas más',
  nobody: 'Nadie ha revisado esta página todavía. Ayuda a revisar la traducción y aparecerás aquí.',
  ctaFirstTitle: '¿Lees {lang}? Sé la primera persona en ayudar.',
  ctaFirstBody: 'Aprobar unos pocos párrafos que se leen bien ya indica a los próximos lectores que pueden confiar en ellos.',
  ctaTitle: '¿Lees {lang}? Nos encantaría tu ayuda.',
  ctaBody: 'Aprueba un párrafo o sugiere una traducción mejor. Cada aporte ayuda a todos los que leen después.',
  ctaHumanTitle: '¿Encontraste un problema que otros pasaron por alto?',
  ctaHumanBody: 'Sugiere una traducción mejor. Las sugerencias son muy bienvenidas.',
  reviewTranslation: 'Revisar la traducción',
  improveTranslation: 'Mejorar la traducción',
  reviewThanks: '¡Gracias por revisar, {login}!',
  reviewOn: 'Estás revisando esta página.',
  reviewHow: 'Selecciona un párrafo para aprobarlo o sugerir una traducción mejor.',
  reviewPr: 'Tus cambios se convierten en una pull request desde tu cuenta de GitHub.',
  reviewGuide: 'Cómo funciona la revisión',
  exitReview: 'Salir de la revisión',
  source: 'Original',
  translation: 'Traducción',
  reviewedBy: 'Revisado por',
  notReviewed: 'Sin revisar',
  approve: 'Aprobar',
  suggest: 'Sugerir un cambio',
  cancel: 'Cancelar',
  save: 'Guardar sugerencia',
  pending: '{n} pendientes',
  submit: 'Enviar tu revisión como pull request',
  submitNote: 'Abre una pull request desde tu cuenta.',
  submitting: 'Abriendo la pull request…',
  trayTitle: 'Tu revisión',
  trayHere: '{n} cambio en esta página||{n} cambios en esta página',
  trayOther: '{n} cambio en otra página||{n} cambios en otra página',
  trayPages: '{n} cambios en {p} páginas',
  countApproved: '{n} aprobado||{n} aprobados',
  countImproved: '{n} traducción mejorada||{n} traducciones mejoradas',
  clear: 'Descartar',
  thisPage: 'Esta página',
  clearAll: 'Descartar todo',
  clearAllConfirm: '¿Descartar los {n} cambios pendientes en {p} páginas?',
  signIn: 'Iniciar sesión con GitHub',
  signInWhy: 'Tu revisión se propone como pull request desde tu cuenta de GitHub.',
  signedInAs: 'Sesión iniciada como {login}',
  signOut: 'Cerrar sesión',
  signInDenied: 'Se canceló el inicio de sesión con GitHub.',
  status_missing: 'Sin traducir: se muestra el original',
  status_stale: 'El original cambió: se muestra el original',
  status_machine: 'Traducción automática, sin revisar',
  status_reviewed: 'Revisado por {n}',
  previous: 'Traducción anterior',
  code: 'Código',
  submitted: 'Pull request abierta',
  submittedThanks: '¡Gracias, {login}!',
  submittedBody: 'Tus cambios están en la pull request {pr}. Tu nombre aparecerá en el aviso de la traducción cuando se fusione.',
  viewOnGitHub: 'Ver en GitHub',
  keepReviewing: 'Seguir revisando',
  held: '{n} sin enviar',
  heldOne: 'Sin enviar',
  retry: 'Reintentar',
  discardHeld: 'Descartarlos',
  discardHeldConfirm: '¿Descartar los {n} cambios sin enviar?',
  submitFailed: 'No se pudo enviar',
  kept: 'Tus cambios se conservan; inténtalo más tarde',
  noStorage: 'Este navegador no guarda tus cambios. Envíalos antes de salir de esta página.',
  close: 'Cerrar',
  languages: 'Idiomas',
};

const TABLE: Record<string, UiStrings> = { en, fr, es };

/** The language the interface strings for `lang` are in. */
export function uiLang(lang: string): string {
  return TABLE[lang] ? lang : TABLE[lang.split('-')[0]] ? lang.split('-')[0] : 'en';
}

export function uiStrings(lang: string): UiStrings {
  return TABLE[uiLang(lang)];
}

export function languageName(code: string, inLang: string): string {
  try {
    return new Intl.DisplayNames([inLang], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function endonym(code: string): string {
  const n = languageName(code, code);
  return n.charAt(0).toLocaleUpperCase(code) + n.slice(1);
}

export function fill(s: string, vars: Record<string, string | number>, lang = 'en'): string {
  const forms = s.split('||');
  if (forms.length === 2 && typeof vars.n === 'number') s = new Intl.PluralRules(lang).select(vars.n) === 'one' ? forms[0] : forms[1];
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
