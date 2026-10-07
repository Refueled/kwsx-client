// Splash screen: hold the animated KWSX logo briefly, fade it out, then hand the
// window over to the player. The station URL is configured here.
const RADIO_URL = 'https://radio.cock.institute/';

const HOLD_MS = 2000;
const FADE_MS = 1000;

const fadeOutAndRedirect = (url) => {
    const content = document.getElementById('content');

    // Fade out the current page
    content.style.opacity = '0';

    setTimeout(() => {
        window.location.href = url; // Redirect to external URL
    }, FADE_MS); // Wait for the CSS transition to finish
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fadeOutAndRedirect(RADIO_URL);
    }, HOLD_MS);
});
