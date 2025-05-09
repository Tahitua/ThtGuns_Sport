document.addEventListener('DOMContentLoaded', function() {
    // Gestion du clic sur les boutons "Regarder"
    document.querySelectorAll('.btn.event').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Masquer tout le contenu principal
            document.querySelector('header').style.display = 'none';
            document.querySelector('main').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            // Afficher le lecteur plein écran
            document.getElementById('fullscreen-player').style.display = 'flex';
            // Injecter l'iframe correspondant
            var iframeUrl = btn.getAttribute('data-iframe');
            document.getElementById('fullscreen-iframe-container').innerHTML = '<iframe src="' + iframeUrl + '" allowfullscreen allow="autoplay" scrolling="no" frameborder="0" style="width:100%;height:100%"></iframe>';
        });
    });
    // Bouton pour fermer le lecteur et réafficher la page
    document.getElementById('close-player').addEventListener('click', function() {
        document.getElementById('fullscreen-player').style.display = 'none';
        document.getElementById('fullscreen-iframe-container').innerHTML = '';
        document.querySelector('header').style.display = '';
        document.querySelector('main').style.display = '';
        document.querySelector('footer').style.display = '';
    });
    // Fermeture du modal
    document.getElementById('close-video').addEventListener('click', function() {
        document.getElementById('video-modal').style.display = 'none';
        document.getElementById('video-iframe-container').innerHTML = '';
    });
    // Fermer le modal en cliquant en dehors du contenu
    document.getElementById('video-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.getElementById('video-iframe-container').innerHTML = '';
        }
    });

    // Masquer automatiquement les lignes avec data-hide-time après l'heure indiquée
    function checkAndHideRows() {
        var now = new Date();
        var currentHours = now.getHours();
        var currentMinutes = now.getMinutes();
        document.querySelectorAll('tr[data-hide-time]').forEach(function(row) {
            var hideTime = row.getAttribute('data-hide-time');
            if (hideTime) {
                var parts = hideTime.split(':');
                var hideHours = parseInt(parts[0], 10);
                var hideMinutes = parseInt(parts[1], 10);
                if (
                    currentHours > hideHours ||
                    (currentHours === hideHours && currentMinutes >= hideMinutes)
                ) {
                    row.style.display = 'none';
                } else {
                    row.style.display = '';
                }
            }
        });
    }
    checkAndHideRows();
    setInterval(checkAndHideRows, 60000);

    // Masquer automatiquement les lignes avec data-start 3h après l'heure de début
    function checkAndHideRowsByStart() {
        var now = new Date();
        document.querySelectorAll('tr[data-start]').forEach(function(row) {
            var startStr = row.getAttribute('data-start');
            if (startStr) {
                // Format attendu : YYYY-MM-DD HH:MM
                var [datePart, timePart] = startStr.split(' ');
                var [year, month, day] = datePart.split('-').map(Number);
                var [hour, minute] = timePart.split(':').map(Number);
                var startDate = new Date(year, month - 1, day, hour, minute);
                var endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // +3h
                if (now >= endDate) {
                    row.style.display = 'none';
                } else {
                    row.style.display = '';
                }
            }
        });
    }
    checkAndHideRowsByStart();
    setInterval(checkAndHideRowsByStart, 60000);

    function updateLiveStatus() {
        var now = new Date();
        document.querySelectorAll('tr').forEach(function(row) {
            var dateCell = row.querySelector('td:nth-child(2)');
            var timeCell = row.querySelector('.dt');
            var statusCell = row.querySelector('td:last-child img');
            if (dateCell && timeCell && statusCell && dateCell.textContent.trim().toLowerCase() === "aujourd'hui") {
                var timeParts = timeCell.textContent.trim().split(':');
                if (timeParts.length === 2) {
                    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(timeParts[0]), parseInt(timeParts[1]));
                    var end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3h
                    if (now >= start && now < end) {
                        statusCell.src = "https://foot22.ru/assets/images/live.gif";
                    } else {
                        statusCell.src = "https://foot22.ru/assets/images/notlive.png";
                    }
                }
            }
        });
    }
    updateLiveStatus();
    setInterval(updateLiveStatus, 60000);

    function updateButtonLiveClass() {
        var now = new Date();
        document.querySelectorAll('tr').forEach(function(row) {
            var dateCell = row.querySelector('td:nth-child(2)');
            var timeCell = row.querySelector('.dt');
            var btn = row.querySelector('.btn.event');
            if (dateCell && timeCell && btn && dateCell.textContent.trim().toLowerCase() === "aujourd'hui") {
                var timeParts = timeCell.textContent.trim().split(':');
                if (timeParts.length === 2) {
                    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(timeParts[0]), parseInt(timeParts[1]));
                    var end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3h
                    if (now >= start && now < end) {
                        btn.classList.remove('btn-default');
                        btn.classList.add('btn-danger');
                    } else {
                        btn.classList.remove('btn-danger');
                        btn.classList.add('btn-default');
                    }
                }
            }
        });
    }
    updateButtonLiveClass();
    setInterval(updateButtonLiveClass, 60000);

    function hideRowsAfter3h() {
        var now = new Date();
        document.querySelectorAll('tr').forEach(function(row) {
            var dateCell = row.querySelector('td:nth-child(2)');
            var timeCell = row.querySelector('.dt');
            if (dateCell && timeCell && dateCell.textContent.trim().toLowerCase() === "aujourd'hui") {
                var timeParts = timeCell.textContent.trim().split(':');
                if (timeParts.length === 2) {
                    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(timeParts[0]), parseInt(timeParts[1]));
                    var end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3h
                    if (now >= end) {
                        row.style.display = 'none';
                    } else {
                        row.style.display = '';
                    }
                }
            }
        });
    }
    hideRowsAfter3h();
    setInterval(hideRowsAfter3h, 60000);

    // === MISE À JOUR "AUJOURD'HUI"/"DEMAIN" POUR JJ-MM-YYYY ===
    function updateDateLabels() {
        var now = new Date();
        document.querySelectorAll('tr').forEach(function(row) {
            var dateCell = row.querySelector('td:nth-child(2)');
            if (!dateCell) return;
            let cellText = dateCell.textContent.trim().toLowerCase();

            // Détecter JJ-MM-YYYY ou JJ/MM/YYYY
            let dateMatch = cellText.match(/^([0-9]{2})[-\/]{1}([0-9]{2})[-\/]{1}([0-9]{4})$/);
            let matchDate;
            if (dateMatch) {
                let [ , day, month, year ] = dateMatch;
                matchDate = new Date(year, parseInt(month,10)-1, parseInt(day,10)); // JS: month 0-based !
            }

            if (matchDate) {
                let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                if (
                    matchDate.getFullYear() === today.getFullYear() &&
                    matchDate.getMonth() === today.getMonth() &&
                    matchDate.getDate() === today.getDate()
                ) {
                    dateCell.textContent = "aujourd'hui";
                } else if (
                    matchDate.getFullYear() === tomorrow.getFullYear() &&
                    matchDate.getMonth() === tomorrow.getMonth() &&
                    matchDate.getDate() === tomorrow.getDate()
                ) {
                    dateCell.textContent = "demain";
                }
            }

            // Si la cellule contient "demain", vérifier si on est le bon jour
            if (cellText === "demain") {
                let timeCell = row.querySelector('.dt');
                if (timeCell) {
                    let timeParts = timeCell.textContent.trim().split(':');
                    if (timeParts.length === 2) {
                        let matchDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, parseInt(timeParts[0]), parseInt(timeParts[1]));
                        if (
                            now.getFullYear() === matchDate.getFullYear() &&
                            now.getMonth() === matchDate.getMonth() &&
                            now.getDate() === matchDate.getDate()
                        ) {
                            dateCell.textContent = "aujourd'hui";
                        }
                    }
                }
            }
        });
    }
    updateDateLabels();
    setInterval(updateDateLabels, 60000);

});

// Anti clic droit
window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Anti touches inspecteur (F12, Ctrl+Shift+I, Ctrl+U, etc.)
window.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
    }
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
    }
    // Ctrl+U
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
    }
    // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
    }
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
    }
});

// Optionnel : détection basique de l'ouverture des devtools
let devtoolsOpen = false;
setInterval(function() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
            devtoolsOpen = true;
            window.location.reload();
        }
    } else {
        devtoolsOpen = false;
    }
}, 1000);