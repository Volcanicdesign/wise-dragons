(function () {
  var FLAG = 'wd_preview_ok';
  var SALT = 'e38cec8fc974cf874032ea518e5fa5cc';
  var EXPECT = '5f7233d1e0538f3e644dc5c010b953106c4009da06c45c9bb722296881e4df5e';

  function unlocked() {
    try { return localStorage.getItem(FLAG) === '1'; }
    catch (e) { return false; }
  }

  function safeNext() {
    var next = 'index.html';
    try { next = new URLSearchParams(location.search).get('next') || 'index.html'; }
    catch (e) {}
    if (!/^[A-Za-z0-9._-]+$/.test(next)) return 'index.html';
    if (next === 'gate.html' || next === 'privacy.html' || next === 'support.html') return 'index.html';
    return next;
  }

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = '';
    for (var i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
    return hex;
  }

  function sameHex(a, b) {
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  if (unlocked()) {
    location.replace(safeNext());
    return;
  }

  var form = document.getElementById('gate-form');
  var input = document.getElementById('preview-code');
  var note = document.getElementById('gate-note');
  if (!form || !input || !note) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var typed = input.value;
    note.hidden = true;
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) {
      note.hidden = false;
      return;
    }
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + typed)).then(function (buf) {
      if (sameHex(toHex(buf), EXPECT)) {
        try { localStorage.setItem(FLAG, '1'); } catch (e) {}
        input.value = '';
        location.replace(safeNext());
        return;
      }
      note.hidden = false;
    }).catch(function () {
      note.hidden = false;
    });
  });
})();
