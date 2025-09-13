// Génération dynamique des 9 cases d'identifiant
const inputGroup = document.getElementById('id-input-group');
for (let i = 0; i < 9; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'input-case';
    input.inputMode = 'numeric';
    input.pattern = '[0-9]';
    input.autocomplete = 'off';
    input.dataset.index = i;
    inputGroup.appendChild(input);
}

// Focus auto et navigation
const cases = document.querySelectorAll('.input-case');
cases.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
        if (/\D/.test(input.value)) input.value = '';
        if (input.value && idx < 8) cases[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
            cases[idx - 1].focus();
        }
    });
});

// Gestion du formulaire
const form = document.getElementById('verif-form');
const loader = document.getElementById('loader');
const resultat = document.getElementById('resultat');
const tuto = document.getElementById('tuto');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultat.textContent = '';
    tuto.classList.add('hidden');
    loader.classList.remove('hidden');

    // Récupère l'identifiant saisi
    let identifiant = '';
    cases.forEach(input => identifiant += input.value);
    if (identifiant.length !== 9) {
        loader.classList.add('hidden');
        resultat.innerHTML = '<span style="color:#e74c3c;font-weight:600">Merci de remplir les 9 chiffres.</span>';
        return;
    }

    // Attente aléatoire 1-10s
    const wait = Math.floor(Math.random() * 10) + 1;
    await new Promise(res => setTimeout(res, wait * 1000));

    // Vérification dans le JSON (format [{id, link}])
    fetch('identifiants.json')
        .then(r => r.json())
        .then(data => {
            loader.classList.add('hidden');
            if (!Array.isArray(data)) {
                resultat.innerHTML = '<span style="color:#e74c3c">Erreur de format du fichier identifiants.json</span>';
                return;
            }
            const found = data.find(obj => obj.id === identifiant);
            if (found && found.link) {
                resultat.innerHTML = `<div style="color:#1a2233;font-weight:600">Ton identifiant <span style='color:#2e6cf6'>${identifiant}</span> est <b>éligible</b>.<br><a href="${found.link}" target="_blank" style="color:#2e6cf6;text-decoration:underline;font-weight:500">Accéder au bot Telegram</a></div>`;
            } else if (found) {
                resultat.innerHTML = `<div style="color:#f39c12;font-weight:600">Ton identifiant <span style='color:#2e6cf6'>${identifiant}</span> est reconnu, mais aucun lien n'est encore attribué.<br>Merci de patienter ou de contacter le support.</div>`;
            } else {
                resultat.innerHTML = '<span style="color:#e74c3c;font-weight:600">Identifiant non reconnu.</span>';
                tuto.classList.remove('hidden');
            }
        })
        .catch(() => {
            loader.classList.add('hidden');
            resultat.innerHTML = '<span style="color:#e74c3c">Erreur lors de la vérification.</span>';
        });
});
