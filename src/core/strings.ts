// Interface strings for the notice and reviewer mode, per target language.
// Languages without an entry use English. Placeholders: {src} source language
// name, {p} a percentage, {n} a count.

export interface UiStrings {
  notice: string;
  untranslated: string;
  noneReviewed: string;
  someReviewed: string;
  fullReviewed: string;
  allReviewed: string;
  fallback: string;
  viewOriginal: string;
  review: string;
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
  clear: string;
  pendingPages: string;
  thisPage: string;
  clearPage: string;
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
  notice: 'This page was translated from {src} by AI.',
  untranslated: 'This page has not been translated yet and is shown in {src}.',
  noneReviewed: 'No one has reviewed it yet.',
  someReviewed: '{p} has been reviewed by at least one person.',
  fullReviewed: '{p} by {n} or more people.',
  allReviewed: 'It has been fully reviewed by people.',
  fallback: '{p} is shown in {src} because the translation is missing or out of date.',
  viewOriginal: 'View original',
  review: 'Review this page',
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
  submit: 'Submit as a pull request',
  clear: 'Discard',
  pendingPages: '{n} pending on {p} pages',
  thisPage: 'this page',
  clearPage: 'Discard this page',
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
  notice: 'Cette page a été traduite de l’{src} par une IA.',
  untranslated: 'Cette page n’a pas encore été traduite et s’affiche en {src}.',
  noneReviewed: 'Personne ne l’a encore relue.',
  someReviewed: '{p} a été relu par au moins une personne.',
  fullReviewed: '{p} par {n} personnes ou plus.',
  allReviewed: 'Elle a été entièrement relue par des personnes.',
  fallback: '{p} est affiché en {src}, car la traduction manque ou n’est plus à jour.',
  viewOriginal: 'Voir l’original',
  review: 'Relire cette page',
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
  submit: 'Soumettre en pull request',
  clear: 'Abandonner',
  pendingPages: '{n} en attente sur {p} pages',
  thisPage: 'cette page',
  clearPage: 'Abandonner cette page',
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
  notice: 'Esta página fue traducida del {src} por IA.',
  untranslated: 'Esta página aún no está traducida y se muestra en {src}.',
  noneReviewed: 'Nadie la ha revisado todavía.',
  someReviewed: 'El {p} ha sido revisado por al menos una persona.',
  fullReviewed: 'El {p} por {n} o más personas.',
  allReviewed: 'Ha sido revisada por completo por personas.',
  fallback: 'El {p} se muestra en {src} porque falta la traducción o está desactualizada.',
  viewOriginal: 'Ver original',
  review: 'Revisar esta página',
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
  submit: 'Enviar como pull request',
  clear: 'Descartar',
  pendingPages: '{n} pendientes en {p} páginas',
  thisPage: 'esta página',
  clearPage: 'Descartar esta página',
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

export function uiStrings(lang: string): UiStrings {
  return TABLE[lang] ?? TABLE[lang.split('-')[0]] ?? en;
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

export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
