const VALID_ROUTES = ['about', 'portfolio', 'adventures', 'trees'];

const ROUTE_TITLES = {
    about:      'About Me — Ryan Little',
    portfolio:  'Portfolio — Ryan Little',
    adventures: 'Adventures — Ryan Little',
    trees:      'Trees I\'ve Visited — Ryan Little',
};

const HOME_TITLE = document.title;

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
            document.title = ROUTE_TITLES[route];
            document.documentElement.classList.add('page-open');
            onNavigateCallback(route, { fromPopState: true });
        } else {
            currentRoute = null;
            document.title = HOME_TITLE;
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
    document.title = ROUTE_TITLES[route];
    history.pushState({ route }, '', `/${route}`);
    document.documentElement.classList.add('page-open');
    onNavigateCallback(route, { fromPopState: false });
}

export function navigateBack() {
    if (!currentRoute) return;
    currentRoute = null;
    document.title = HOME_TITLE;
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
            document.title = ROUTE_TITLES[redirectPath];
            document.documentElement.classList.add('page-open');
            history.replaceState({ route: redirectPath }, '', `/${redirectPath}`);
            onNavigateCallback(redirectPath, { fromPopState: false });
            return;
        }
    }

    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (path && VALID_ROUTES.includes(path)) {
        currentRoute = path;
        document.title = ROUTE_TITLES[path];
        document.documentElement.classList.add('page-open');
        history.replaceState({ route: path }, '', `/${path}`);
        onNavigateCallback(path, { fromPopState: false });
    }
}
