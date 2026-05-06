const EXTERNAL_LINKS_SCRIPT = `<script>
(function(){
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
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
