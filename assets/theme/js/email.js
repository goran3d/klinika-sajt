document.addEventListener("DOMContentLoaded", function() {
  const user = "kotur";
  const domain = "t-com.me";

  document.querySelectorAll(".email").forEach(function(el) {
    el.innerHTML = `<a href="mailto:${user}@${domain}">${user}@${domain}</a>`;
  });
});
