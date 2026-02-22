// Global variables
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;
let initialPositions = new Map();
let isDrawingLine = false;
let lineStartPlayer = null;
let lines = [];
let currentOrientation = 'portrait';

// Canvas setup
const canvas = document.getElementById('linesCanvas');
const ctx = canvas.getContext('2d');
const field = document.getElementById('field');

function resizeCanvas() {
    canvas.width = field.offsetWidth;
    canvas.height = field.offsetHeight;
    redrawLines();
}

window.addEventListener('resize', resizeCanvas);
// Call resize after a small delay to ensure field has settled
setTimeout(resizeCanvas, 100);

// Initialize player positions
function saveInitialPositions() {
    const players = document.querySelectorAll('.player');
    players.forEach(player => {
        if (!player.classList.contains('sub')) {
            const position = {
                left: player.style.left,
                top: player.style.top
            };
            initialPositions.set(player, position);
        }
    });
}

// Formation definitions with dual orientation support
const formations = {
    '4-3-3': {
        positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'RM', 'LW', 'ST', 'RW'],
        portrait: {
            red: [{left:50,top:5},{left:15,top:20},{left:40,top:20},{left:60,top:20},{left:85,top:20},{left:20,top:35},{left:50,top:35},{left:80,top:35},{left:25,top:47},{left:50,top:47},{left:75,top:47}],
            blue: [{left:50,top:95},{left:85,top:80},{left:60,top:80},{left:40,top:80},{left:15,top:80},{left:80,top:65},{left:50,top:65},{left:20,top:65},{left:75,top:53},{left:50,top:53},{left:25,top:53}]
        },
        landscape: {
            red: [{left:5,top:50},{left:20,top:15},{left:20,top:40},{left:20,top:60},{left:20,top:85},{left:35,top:20},{left:35,top:50},{left:35,top:80},{left:47,top:25},{left:47,top:50},{left:47,top:75}],
            blue: [{left:95,top:50},{left:80,top:85},{left:80,top:60},{left:80,top:40},{left:80,top:15},{left:65,top:80},{left:65,top:50},{left:65,top:20},{left:53,top:75},{left:53,top:50},{left:53,top:25}]
        }
    },
    '4-4-2': {
        positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
        portrait: {
            red: [{left:50,top:5},{left:15,top:20},{left:40,top:20},{left:60,top:20},{left:85,top:20},{left:15,top:35},{left:40,top:35},{left:60,top:35},{left:85,top:35},{left:38,top:47},{left:62,top:47}],
            blue: [{left:50,top:95},{left:85,top:80},{left:60,top:80},{left:40,top:80},{left:15,top:80},{left:85,top:65},{left:60,top:65},{left:40,top:65},{left:15,top:65},{left:62,top:53},{left:38,top:53}]
        },
        landscape: {
            red: [{left:5,top:50},{left:20,top:15},{left:20,top:40},{left:20,top:60},{left:20,top:85},{left:35,top:15},{left:35,top:40},{left:35,top:60},{left:35,top:85},{left:47,top:38},{left:47,top:62}],
            blue: [{left:95,top:50},{left:80,top:85},{left:80,top:60},{left:80,top:40},{left:80,top:15},{left:65,top:85},{left:65,top:60},{left:65,top:40},{left:65,top:15},{left:53,top:62},{left:53,top:38}]
        }
    },
    '3-5-2': {
        positions: ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'],
        portrait: {
            red: [{left:50,top:5},{left:25,top:20},{left:50,top:20},{left:75,top:20},{left:10,top:35},{left:33,top:35},{left:50,top:35},{left:67,top:35},{left:90,top:35},{left:38,top:47},{left:62,top:47}],
            blue: [{left:50,top:95},{left:75,top:80},{left:50,top:80},{left:25,top:80},{left:90,top:65},{left:67,top:65},{left:50,top:65},{left:33,top:65},{left:10,top:65},{left:62,top:53},{left:38,top:53}]
        },
        landscape: {
            red: [{left:5,top:50},{left:20,top:25},{left:20,top:50},{left:20,top:75},{left:35,top:10},{left:35,top:33},{left:35,top:50},{left:35,top:67},{left:35,top:90},{left:47,top:38},{left:47,top:62}],
            blue: [{left:95,top:50},{left:80,top:75},{left:80,top:50},{left:80,top:25},{left:65,top:90},{left:65,top:67},{left:65,top:50},{left:65,top:33},{left:65,top:10},{left:53,top:62},{left:53,top:38}]
        }
    },
    '5-3-2': {
        positions: ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'LM', 'CM', 'RM', 'ST', 'ST'],
        portrait: {
            red: [{left:50,top:5},{left:10,top:20},{left:32,top:20},{left:50,top:20},{left:68,top:20},{left:90,top:20},{left:20,top:35},{left:50,top:35},{left:80,top:35},{left:38,top:47},{left:62,top:47}],
            blue: [{left:50,top:95},{left:90,top:80},{left:68,top:80},{left:50,top:80},{left:32,top:80},{left:10,top:80},{left:80,top:65},{left:50,top:65},{left:20,top:65},{left:62,top:53},{left:38,top:53}]
        },
        landscape: {
            red: [{left:5,top:50},{left:20,top:10},{left:20,top:32},{left:20,top:50},{left:20,top:68},{left:20,top:90},{left:35,top:20},{left:35,top:50},{left:35,top:80},{left:47,top:38},{left:47,top:62}],
            blue: [{left:95,top:50},{left:80,top:90},{left:80,top:68},{left:80,top:50},{left:80,top:32},{left:80,top:10},{left:65,top:80},{left:65,top:50},{left:65,top:20},{left:53,top:62},{left:53,top:38}]
        }
    },
    '4-2-3-1': {
        positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LW', 'CAM', 'RW', 'ST'],
        portrait: {
            red: [{left:50,top:5},{left:15,top:20},{left:40,top:20},{left:60,top:20},{left:85,top:20},{left:38,top:32},{left:62,top:32},{left:20,top:42},{left:50,top:42},{left:80,top:42},{left:50,top:47}],
            blue: [{left:50,top:95},{left:85,top:80},{left:60,top:80},{left:40,top:80},{left:15,top:80},{left:62,top:68},{left:38,top:68},{left:80,top:58},{left:50,top:58},{left:20,top:58},{left:50,top:53}]
        },
        landscape: {
            red: [{left:5,top:50},{left:20,top:15},{left:20,top:40},{left:20,top:60},{left:20,top:85},{left:32,top:38},{left:32,top:62},{left:42,top:20},{left:42,top:50},{left:42,top:80},{left:47,top:50}],
            blue: [{left:95,top:50},{left:80,top:85},{left:80,top:60},{left:80,top:40},{left:80,top:15},{left:68,top:62},{left:68,top:38},{left:58,top:80},{left:58,top:50},{left:58,top:20},{left:53,top:50}]
        }
    },
    '3-4-3': {
        positions: ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
        portrait: {
            red: [{left:50,top:5},{left:25,top:20},{left:50,top:20},{left:75,top:20},{left:15,top:35},{left:40,top:35},{left:60,top:35},{left:85,top:35},{left:25,top:47},{left:50,top:47},{left:75,top:47}],
            blue: [{left:50,top:95},{left:75,top:80},{left:50,top:80},{left:25,top:80},{left:85,top:65},{left:60,top:65},{left:40,top:65},{left:15,top:65},{left:75,top:53},{left:50,top:53},{left:25,top:53}]
        },
        landscape: {
            red: [{left:5,top:50},{left:20,top:25},{left:20,top:50},{left:20,top:75},{left:35,top:15},{left:35,top:40},{left:35,top:60},{left:35,top:85},{left:47,top:25},{left:47,top:50},{left:47,top:75}],
            blue: [{left:95,top:50},{left:80,top:75},{left:80,top:50},{left:80,top:25},{left:65,top:85},{left:65,top:60},{left:65,top:40},{left:65,top:15},{left:53,top:75},{left:53,top:50},{left:53,top:25}]
        }
    }
};

// Function to apply formation
function applyFormation(team, formationName) {
    const formation = formations[formationName];
    if (!formation) return;

    const teamPlayers = Array.from(document.querySelectorAll(`.player.${team}`))
        .filter(p => !p.classList.contains('sub'));

    const layout = formation[currentOrientation][team];
    const positions = formation.positions;

    teamPlayers.forEach((player, index) => {
        if (layout[index]) {
            player.style.left = layout[index].left + '%';
            player.style.top = layout[index].top + '%';

            const label = player.querySelector('.position-label');
            if (label && positions[index]) {
                label.textContent = positions[index];
                player.dataset.position = positions[index];
            }
        }
    });
    saveInitialPositions();
}

// Function to apply orientation
function applyOrientation(orientation) {
    currentOrientation = orientation;
    field.className = `field ${orientation}`;

    // Re-apply current formations to all players
    const redFormation = document.getElementById('redFormation').value;
    const blueFormation = document.getElementById('blueFormation').value;

    applyFormation('red', redFormation);
    applyFormation('blue', blueFormation);

    // Refresh canvas
    setTimeout(resizeCanvas, 300);
}

// Event Listeners
document.getElementById('orientationSelect').addEventListener('change', (e) => {
    applyOrientation(e.target.value);
});

document.getElementById('redFormation').addEventListener('change', (e) => {
    applyFormation('red', e.target.value);
});

document.getElementById('blueFormation').addEventListener('change', (e) => {
    applyFormation('blue', e.target.value);
});

// Drag and drop functionality
const players = document.querySelectorAll('.player');

players.forEach(player => {
    if (player.classList.contains('sub')) return;
    player.addEventListener('mousedown', startDrag);
    player.addEventListener('touchstart', startDrag);
    player.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        startDrawingLine(player);
    });
});

function startDrag(e) {
    e.preventDefault();
    draggedElement = e.target.closest('.player') || e.target.closest('.ball');
    if (!draggedElement) return;

    draggedElement.classList.add('dragging');
    const rect = draggedElement.getBoundingClientRect();

    if (e.type === 'touchstart') {
        offsetX = e.touches[0].clientX - rect.left - rect.width / 2;
        offsetY = e.touches[0].clientY - rect.top - rect.height / 2;
    } else {
        offsetX = e.clientX - rect.left - rect.width / 2;
        offsetY = e.clientY - rect.top - rect.height / 2;
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function drag(e) {
    if (!draggedElement) return;
    const fieldRect = field.getBoundingClientRect();
    let clientX, clientY;

    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    let x = ((clientX - fieldRect.left - offsetX) / fieldRect.width) * 100;
    let y = ((clientY - fieldRect.top - offsetY) / fieldRect.height) * 100;

    x = Math.max(2, Math.min(98, x));
    y = Math.max(2, Math.min(98, y));

    draggedElement.style.left = x + '%';
    draggedElement.style.top = y + '%';
    redrawLines();
}

function stopDrag() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
}

// Ball Dragging
const ball = document.getElementById('ball');
ball.addEventListener('mousedown', startDrag);
ball.addEventListener('touchstart', startDrag);

// Line drawing
function startDrawingLine(player) {
    if (!lineStartPlayer) {
        lineStartPlayer = player;
        player.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.8)';
    } else {
        if (lineStartPlayer !== player) {
            lines.push({
                start: lineStartPlayer,
                end: player,
                color: lineStartPlayer.dataset.team === 'red' ? '#ff416c' : '#4facfe'
            });
            redrawLines();
        }
        lineStartPlayer.style.boxShadow = '';
        lineStartPlayer = null;
    }
}

function redrawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => {
        const startRect = line.start.getBoundingClientRect();
        const endRect = line.end.getBoundingClientRect();
        const fieldRect = field.getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2 - fieldRect.left;
        const startY = startRect.top + startRect.height / 2 - fieldRect.top;
        const endX = endRect.left + endRect.width / 2 - fieldRect.left;
        const endY = endRect.top + endRect.height / 2 - fieldRect.top;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.setLineDash([10, 5]);
        ctx.stroke();

        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 15;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI / 6), endY - arrowLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowLength * Math.cos(angle + Math.PI / 6), endY - arrowLength * Math.sin(angle + Math.PI / 6));
        ctx.setLineDash([]);
        ctx.stroke();
    });
}

// Button controls
document.getElementById('resetBtn').addEventListener('click', () => {
    const redFormation = document.getElementById('redFormation').value;
    const blueFormation = document.getElementById('blueFormation').value;
    applyFormation('red', redFormation);
    applyFormation('blue', blueFormation);
    redrawLines();
});

document.getElementById('clearLinesBtn').addEventListener('click', () => {
    lines = [];
    if (lineStartPlayer) {
        lineStartPlayer.style.boxShadow = '';
        lineStartPlayer = null;
    }
    redrawLines();
});

document.getElementById('switchTeamsBtn').addEventListener('click', () => {
    const allPlayers = document.querySelectorAll('.player');
    const redPlayers = Array.from(allPlayers).filter(p => p.dataset.team === 'red' && !p.classList.contains('sub'));
    const bluePlayers = Array.from(allPlayers).filter(p => p.dataset.team === 'blue' && !p.classList.contains('sub'));

    for (let i = 0; i < Math.min(redPlayers.length, bluePlayers.length); i++) {
        const rL = redPlayers[i].style.left;
        const rT = redPlayers[i].style.top;
        redPlayers[i].style.left = bluePlayers[i].style.left;
        redPlayers[i].style.top = bluePlayers[i].style.top;
        bluePlayers[i].style.left = rL;
        bluePlayers[i].style.top = rT;
    }
    saveInitialPositions();
    redrawLines();
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    applyOrientation('portrait');
});

// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lineStartPlayer) {
        lineStartPlayer.style.boxShadow = '';
        lineStartPlayer = null;
    }
    if (e.key === 'r' || e.key === 'R') document.getElementById('resetBtn').click();
    if (e.key === 'c' || e.key === 'C') document.getElementById('clearLinesBtn').click();
});
