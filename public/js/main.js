// Disparition automatique des messages flash après quelques secondes
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alert').forEach((el) => {
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }, 4000);
  });
});
