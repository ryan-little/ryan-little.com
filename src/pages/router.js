const VALID_ROUTES = ['about', 'portfolio', 'adventures', 'trees'];

let currentRoute = null;
let onNavigateCallback = null;
let onBackCallback = null;

export function initRouter({ onNavigate, onBack }) {
    onNavigateCallback = onNavigate;
    onBackCallback = onBack;

    window.addEventListener('popstate', (event) => {
        const route = event.state?.route || null;
        if (route && VALID_ROUTES.includes(route)) {
            currentRoute = route;
            document.documentElement.classList.add('page-open');
            onNavigateCallback(route, { fromPopState: true });
        } else {
            currentRoute = null;
            document.documentElement.classList.remove('page-open');
            onBackCallback({ fromPopState: true });
        }
    });

    checkDeepLink();
}

export function navigateTo(route) {
    if (!VALID_ROUTES.includes(route)) return;
    if (route === currentRoute) return;

    currentRoute = route;
    history.pushState({ route }, '', `/${route}`);
    document.documentElement.classList.add('page-open');
    onNavigateCallback(route, { fromPopState: false });
}

export function navigateBack() {
    if (!currentRoute) return;
    currentRoute = null;
    history.replaceState({ route: null }, '', '/');
    document.documentElement.classList.remove('page-open');
    onBackCallback({ fromPopState: false });
}

export function getCurrentRoute() { return currentRoute; }

function checkDeepLink() {
    const redirectPath = sessionStorage.getItem('spa-redirect');
    if (redirectPath) {
        sessionStorage.removeItem('spa-redirect');
        if (VALID_ROUTES.includes(redirectPath)) {
            currentRoute = redirectPath;
            document.documentElement.classList.add('page-open');
            history.replaceState({ route: redirectPath }, '', `/${redirectPath}`);
            onNavigateCallback(redirectPath, { fromPopState: false });
            return;
        }
    }

    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (path && VALID_ROUTES.includes(path)) {
        currentRoute = path;
        document.documentElement.classList.add('page-open');
        history.replaceState({ route: path }, '', `/${path}`);
        onNavigateCallback(path, { fromPopState: false });
    }
}
