// Layer legend — a small toggle panel for the /earth scene.
// Hidden by default behind a small handle; reveals on hover (desktop) or tap
// (touch). Pass a list of { key, label, enabled, apply(bool) } descriptors.
// Per-layer state persists in localStorage.

const STORAGE_KEY = 'earth-layers-v1';

function loadState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* ignore quota / private-mode errors */
    }
}

export function createLegend(container, layers) {
    const state = loadState();

    const panel = document.createElement('div');
    panel.className = 'layer-legend';

    // Always-visible handle (the only thing shown until hover/tap).
    const handle = document.createElement('button');
    handle.className = 'legend-handle';
    handle.type = 'button';
    handle.setAttribute('aria-label', 'Toggle layers');
    handle.innerHTML = '<span></span><span></span><span></span>';
    // Tap toggles a pinned-open state for touch devices (which have no hover).
    handle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
    });
    // Tapping anywhere outside the open panel closes it.
    document.addEventListener('click', (e) => {
        if (panel.classList.contains('open') && !panel.contains(e.target)) {
            panel.classList.remove('open');
        }
    });

    const body = document.createElement('div');
    body.className = 'legend-body';

    const title = document.createElement('div');
    title.className = 'legend-title';
    title.textContent = 'Layers';
    body.appendChild(title);

    const list = document.createElement('div');
    list.className = 'legend-list';

    for (const layer of layers) {
        const enabled = layer.key in state ? state[layer.key] : layer.enabled;
        layer.apply(enabled);

        const row = document.createElement('label');
        row.className = 'legend-row';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = enabled;
        input.addEventListener('change', () => {
            layer.apply(input.checked);
            state[layer.key] = input.checked;
            saveState(state);
        });

        const text = document.createElement('span');
        text.textContent = layer.label;

        row.append(input, text);
        list.appendChild(row);
    }

    body.appendChild(list);
    panel.append(handle, body);
    container.appendChild(panel);
    return panel;
}
