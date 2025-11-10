// Test script to verify theme switching works
console.log('🎨 Testing theme switching...');

// Check if we're in the browser
if (typeof window !== 'undefined') {
  // Get the HTML element
  const html = document.documentElement;

  console.log('Current classes on html:', html.className);
  console.log('Current theme attribute:', html.getAttribute('data-theme'));

  // Test adding dark class
  console.log('Adding dark class...');
  html.classList.add('dark');

  // Check computed styles
  const computedStyle = getComputedStyle(document.body);
  console.log('Body background after dark:', computedStyle.backgroundColor);
  console.log('Body color after dark:', computedStyle.color);

  // Test removing dark class
  setTimeout(() => {
    console.log('Removing dark class...');
    html.classList.remove('dark');

    const computedStyleLight = getComputedStyle(document.body);
    console.log('Body background after light:', computedStyleLight.backgroundColor);
    console.log('Body color after light:', computedStyleLight.color);
  }, 2000);
}