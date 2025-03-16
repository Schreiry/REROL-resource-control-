// Example of a simple animation function
function animateElement(element, animationName, callback) {
  element.classList.add(animationName);

  function handleAnimationEnd() {
    element.classList.remove(animationName);
    element.removeEventListener('animationend', handleAnimationEnd);

    if (typeof callback === 'function') callback();
  }

  element.addEventListener('animationend', handleAnimationEnd);
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-row-btn');
  addButton.addEventListener('click', () => {
    animateElement(addButton, 'fade-in');
  });
});