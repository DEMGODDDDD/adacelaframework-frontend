const ADMIN_GREETING_INDEX_KEY = 'demgodAquatics.adminGreetingIndex';

const greetingTemplates = [
  (name) => `Back at it, ${name}`,
  () => 'Back at it!',
  () => 'Coffee and Claude time?',
  (name) => `Evening, ${name}`,
  (name) => `Good morning, ${name}`,
  (name) => `Hey there, ${name}`,
  () => "How's it going?",
  (name, day) => `Happy ${day}, ${name}`,
  () => "What's on your mind tonight?",
];

function chooseGreetingIndex() {
  return Math.floor(Math.random() * greetingTemplates.length);
}

export function refreshAdminGreeting() {
  const index = chooseGreetingIndex();
  window.sessionStorage.setItem(ADMIN_GREETING_INDEX_KEY, String(index));
}

export function clearAdminGreeting() {
  window.sessionStorage.removeItem(ADMIN_GREETING_INDEX_KEY);
}

export function getAdminGreeting(adminName = 'demgod') {
  const storedIndex = Number(window.sessionStorage.getItem(ADMIN_GREETING_INDEX_KEY));
  const index = Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < greetingTemplates.length
    ? storedIndex
    : chooseGreetingIndex();

  window.sessionStorage.setItem(ADMIN_GREETING_INDEX_KEY, String(index));

  const day = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date());
  return greetingTemplates[index](adminName || 'demgod', day);
}
