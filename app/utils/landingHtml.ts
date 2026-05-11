const EXTERNAL_LINKS_SCRIPT = `<script>
(function(){
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    // Hash anchors: <base target="_top"> rompe el scroll porque manda el click
    // a la ventana padre. Manejarlos localmente dentro del iframe.
    if (href.charAt(0) === '#' && href.length > 1) {
      var id = href.slice(1);
      var target = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (/^(https?:)?\\/\\//i.test(href) && !a.target) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  }, true);
})();
</script>`

export function withExternalLinksFix(html: string): string {
  if (!html) return html
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${EXTERNAL_LINKS_SCRIPT}</body>`)
  }
  return html + EXTERNAL_LINKS_SCRIPT
}
