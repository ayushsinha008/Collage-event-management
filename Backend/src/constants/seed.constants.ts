/** Patterns for demo/seed data that must never appear in production listings. */
export const SEED_EVENT_TITLE = /^Tech Fest Event \d+$/i;
export const SEED_EVENT_DESCRIPTION = /^Description for awesome event \d+$/i;
export const SEED_USER_EMAIL = /@festflow\.com$/i;

/** Mongo filter — exclude seeded mock events from public/organizer queries. */
export const excludeSeedEventsFilter = {
  $nor: [{ title: SEED_EVENT_TITLE }, { description: SEED_EVENT_DESCRIPTION }],
};
