export const routes = {
  home: '/',
  auth: {
    signIn: '/sign-in',
    register: '/register',
  },
  tests: {
    selection: '/test-selection',
    ideology: '/ideology-test',
    results: '/results',
  },
  insights: '/insights',
  leaderboard: '/leaderboard',
  settings: '/settings',
  achievements: '/achievements',
  api: {
    auth: '/api/auth',
    user: '/api/user',
    tests: '/api/tests',
    insights: '/api/insights',
    categories: '/api/categories',
    ideologies: '/api/ideologies',
    verify: '/api/verify',
    wallet: '/api/wallet',
  },
} as const

// Type-safe route getters for direct routes
export const getHomeRoute = () => routes.home
export const getInsightsRoute = () => routes.insights
export const getLeaderboardRoute = () => routes.leaderboard
export const getSettingsRoute = () => routes.settings
export const getAchievementsRoute = () => routes.achievements

// Type-safe route getters for nested routes
export const auth = {
  signIn: () => routes.auth.signIn,
  register: () => routes.auth.register,
} as const

export const tests = {
  selection: () => routes.tests.selection,
  ideology: () => routes.tests.ideology,
  results: () => routes.tests.results,
} as const

export const api = {
  auth: () => routes.api.auth,
  user: () => routes.api.user,
  tests: () => routes.api.tests,
  insights: () => routes.api.insights,
  categories: () => routes.api.categories,
  ideologies: () => routes.api.ideologies,
  verify: () => routes.api.verify,
  wallet: () => routes.api.wallet,
} as const 