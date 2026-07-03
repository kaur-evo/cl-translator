/* ============================================================
   Password gate for the shared prototype.

   Honest scope: this is a DETERRENT for casual access to a shared
   URL, not real security — a static site's code is always readable.
   That is acceptable here because the bundle contains no secrets:
   the checklist data is fake and API keys are viewer-supplied at
   runtime (sessionStorage only).

   Hardening applied:
   - only a SHA-256 hash of the password ships in the code
     (no plaintext anywhere in the repo),
   - growing delay after wrong attempts,
   - unlock is per browser session (sessionStorage).

   To change the password, run:
     node -e "const c=require('crypto');console.log(c.createHash('sha256').update('cl-proto::' + 'NEW-PASSWORD').digest('hex'))"
   and replace HASH below.
   ============================================================ */
(function () {
  const HASH = "e47f256a1c60aef5ebf5557b2a59e11aa29dfc328dc82d26e4691b169c317a48";
  const SALT = "cl-proto::";
  const OK = "cl_gate_ok";

  if (sessionStorage.getItem(OK) === "1") return;

  const gate = document.createElement("div");
  gate.className = "gate";
  gate.innerHTML = `
    <div class="card gate-card">
      <div class="header58"><h2>Checklist translations</h2></div>
      <div class="ov-content">
        <p class="gate-sub">Evocon prototype. Enter the password to continue.</p>
        <div class="edit-field-wrap">
          <div class="edit-field"><textarea id="gate-pw" rows="1" style="-webkit-text-security:disc" autocomplete="off" placeholder="Password"></textarea></div>
          <span class="input-bottom"><span class="cap gate-err"></span></span>
        </div>
      </div>
      <div class="footer">
        <span class="spacer"></span>
        <button class="btn btn-primary" id="gate-go">enter</button>
      </div>
    </div>`;
  document.body.appendChild(gate);

  const pw = gate.querySelector("#gate-pw");
  const err = gate.querySelector(".gate-err");
  const go = gate.querySelector("#gate-go");
  let tries = 0;
  setTimeout(() => pw.focus(), 50);

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function attempt() {
    go.disabled = true;
    const hash = await sha256(SALT + pw.value);
    // growing delay makes guessing tedious
    await new Promise(r => setTimeout(r, Math.min(200 + tries * 400, 3000)));
    if (hash === HASH) {
      sessionStorage.setItem(OK, "1");
      gate.remove();
      return;
    }
    tries++;
    err.textContent = "Wrong password, try again.";
    err.classList.add("bad");
    pw.value = "";
    go.disabled = false;
    pw.focus();
  }

  go.addEventListener("click", attempt);
  pw.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); attempt(); }
  });
})();
