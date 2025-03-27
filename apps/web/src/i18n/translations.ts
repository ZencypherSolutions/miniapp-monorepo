export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      submit: 'Submit',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      search: 'Search',
      clear: 'Clear',
      share: 'Share'
    },
    settings: {
      title: 'Settings',
      membership: {
        premium: 'Premium Member',
        basic: 'Basic Member',
        active: 'Active',
        inactive: 'Inactive',
        expiryDate: 'Expiry Date',
        nextPayment: 'Your next membership payment is scheduled for',
        noSubscription: 'No active subscription',
        upgrade: 'Upgrade to Awaken Pro',
        unlockFeatures: 'Unlock advanced features and exclusive content'
      },
      items: {
        notifications: 'Notifications',
        darkTheme: 'Dark Theme',
        language: 'Language',
        privacyPolicy: 'View Privacy Policy',
        helpCenter: 'Help Center',
        reportIssue: 'Report an Issue'
      },
      signOut: 'Sign Out',
      signingOut: 'Signing out...'
    },
    home: {
      welcome: 'Welcome Back!',
      todaysInsight: 'Track your progress and continue your journey of self-discovery',
      viewAll: 'View All',
      completedTests: 'Completed Tests',
      noTestsYet: 'No tests completed yet',
      takeTest: 'Take a Test',
      verifyAccount: 'Verify your account',
      dailyStreaks: 'Daily Streaks',
      buildLearningPath: 'Build your learning path',
      dailyChallenges: 'DAILY CHALLENGES',
      comingSoon: 'Coming Soon',
      verifyModal: {
        title: 'Not Verified yet?',
        description: 'Use your World ID app to verify your identity!',
        instruction: 'Simply tap "Verify!" below and follow the prompts to complete verification.',
        benefits: 'By verifying you will have access to more features on the app.',
        maybeLater: 'Maybe Later',
        verify: 'Verify!'
      }
    },
    signIn: {
      title: 'Sign In',
      subtitle: 'Your journey toward understanding your true self begins here.',
      worldIdButton: 'World ID',
      connecting: 'Connecting...',
      privacyNotice: 'By signing in, you agree to our',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      and: 'and',
      walletAuthStatement: 'Sign in with your Ethereum wallet',
      headings: {
        firstLine: {
          prefix: 'Discover Your',
          words: {
            0: 'Truth',
            1: 'Core',
            2: 'Spirit',
            3: 'Soul',
            4: 'Heart',
            5: 'Being',
            6: 'Purpose'
          }
        },
        secondLine: {
          prefix: 'Transform Your',
          words: {
            0: 'View',
            1: 'Lens',
            2: 'Vision',
            3: 'Mind',
            4: 'Path',
            5: 'Light',
            6: 'World'
          }
        }
      },
      errors: {
        authCancelled: 'Authentication was cancelled',
        authFailed: 'Authentication failed',
        invalidSiweFormat: 'Failed to create authentication message. Please try again.'
      }
    },
    register: {
      title: "Let's get to know a little bit about you...",
      subtitle: 'Please fill up the following spaces to begin.',
      form: {
        name: 'Name',
        lastName: 'Last Name',
        email: 'Email',
        age: 'Age',
        country: 'Country',
        submit: 'Complete Registration',
        selectAge: 'Select age'
      }
    },
    welcome: {
      title: 'Welcome to your journey',
      greeting: 'Hi, {{name}}!',
      description: 'Your journey of self-discovery begins now. Explore tests, gain insights, and understand yourself better.',
      getStarted: 'Get Started'
    },
    ideologyTest: {
      title: 'Ideology Test',
      instructions: 'Please answer the following questions honestly to get accurate results.',
      questionCount: 'Question {{current}} of {{total}}',
      options: {
        stronglyAgree: 'Strongly Agree',
        agree: 'Agree',
        neutral: 'Neutral',
        disagree: 'Disagree',
        stronglyDisagree: 'Strongly Disagree'
      },
      navigation: {
        next: 'Next',
        previous: 'Previous',
        finish: 'Finish Test'
      },
      leaveTest: 'Leave Test',
      leaveConfirmation: 'Are you sure you want to leave? Your progress will be saved.'
    },
    results: {
      title: 'Your Results',
      summary: 'Insights based on your results',
      shareResults: 'Share Results',
      viewInsights: 'View Insights',
      retakeTest: 'Retake Test',
      scores: {
        economic: 'Economic',
        diplomatic: 'Diplomatic',
        civil: 'Civil',
        societal: 'Societal'
      }
    },
    insights: {
      title: 'Your Ideology Insights',
      description: 'Explore how your values align across key ideological dimensions.',
      advancedInsights: 'Advanced Insights',
      unlockAdvancedInsights: 'Unlock Advanced Insights',
      shareResults: 'Share Results',
      noInsightsAvailable: 'No insights available. Please try again later.',
      shareYourResults: 'Share Your Results',
      advancedIdeologicalAnalysis: 'Advanced Ideological Analysis',
      unlockAdvancedInsightsTitle: 'Unlock Advanced Insights',
      proDescription: 'Dive deeper into your ideological profile with Awaken Pro. Get comprehensive analysis and personalized insights.',
      upgradeToPro: 'Upgrade to Pro',
      shareAnalysis: 'Share Analysis',
      perspective: 'Perspective',
      estimatedIdeology: 'Estimated Ideology',
      yourIdeology: 'Your Ideology',
      closestPoliticalMatch: 'Your Closest Political Match',
      noMatchAvailable: 'No match available',
      basedOnAlignment: 'Based on your political alignment',
      tagAndShare: 'Tag @MindVault & share your results!',
      getFullExperience: 'Get the full experience on WorldApp',
      ideologyNotAvailable: 'Ideology not available'
    },
    testSelection: {
      title: 'Available Tests',
      description: 'Explore our collection of tests to understand yourself better',
      searchPlaceholder: 'Search for tests...',
      ideologyTest: 'Ideology Test',
      personalityTest: 'Personality Test',
      startTest: 'Start Test',
      achievementsSoon: 'Achievements coming soon! 🏆',
      moreSoon: 'More tests coming soon! Stay tuned 🎉'
    },
    leaderboard: {
      title: 'Leaderboard',
      description: 'See how you compare with others',
      rank: 'Rank',
      user: 'User',
      score: 'Score',
      comingSoon: 'Coming Soon',
      comingSoonDescription: 'The leaderboard feature is currently under development. Check back soon to compete with others!',
      filter: {
        all: 'All Time',
        month: 'This Month',
        week: 'This Week',
        day: 'Today'
      }
    },
    achievements: {
      title: 'Achievements',
      description: 'Celebrate your progress and discover what\'s next on your journey',
      points: '{{current}}/{{max}} points',
      nextLevel: 'Reach the next level to unlock new badges and exclusive content!',
      locked: 'Locked',
      unlocked: 'Unlocked',
      progress: '{{current}}/{{total}} completed',
      comingSoon: 'Coming Soon',
      comingSoonDescription: 'The achievements feature is currently under development. Check back soon to celebrate your progress!'
    },
    awakenPro: {
      title: 'Step Into the Next Level',
      description: 'Unlock premium features and content',
      currentPlan: 'Current plan:',
      popular: 'Popular',
      billingCycle: 'Per month, billed monthly',
      paymentDescription: 'Upgrade to Awaken Pro - 1 Month Subscription',
      features: {
        advancedInsights: 'Advanced Insights',
        earlyAccess: 'Early access to new features',
        exclusiveCommunity: 'Exclusive Community Access',
        prioritySupport: 'Priority Support',
        aiChat: 'Soon chat with AI',
        moreSoon: 'More coming soon...'
      },
      pricing: {
        monthly: '$3.50/month',
        yearly: '$35/year',
        lifetime: '$99 one-time'
      },
      subscribe: 'Upgrade to Pro',
      alreadySubscribed: 'You are already subscribed'
    },
    notFound: {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
      backHome: 'Back to Home'
    },
    tests: {
      instructions: {
        title: 'Uncover Your Political Values',
        beforeYouStart: 'Before you start',
        testDescription: 'This test consists of {{count}} thought-provoking statements designed to explore your political beliefs. Your answers will reflect your position across eight core values.',
        honestResponses: 'Please respond honestly, based on your true opinions.',
        estimatedTime: 'Estimated Time',
        minutes: '{{count}} min',
        progress: 'Progress',
        startTest: 'Start test',
        continueTest: 'Continue test'
      }
    },
    testCard: {
      progress: 'Progress',
      ofTestCompleted: 'of test completed',
      achievements: 'Achievements',
      achievement: 'achievement'
    },
    achievementCard: {
      obtainedOn: 'Obtained on {{date}}'
    },
    toggle: {
      notificationsOn: 'Notifications are enabled',
      notificationsOff: 'Notifications are disabled',
      darkModeOn: 'Dark mode is enabled',
      darkModeOff: 'Dark mode is disabled'
    },
    profile: {
      level: 'Level',
      levelProgress: 'Level progress',
      pointsToLevelUp: '{{points}}/{{maxPoints}} points to level up',
      dailyMotivation: 'Your daily motivation'
    },
    ideology: {
      centrist: 'Centrist',
      moderate: 'Moderate',
      balanced: 'Balanced',
      neutral: 'Neutral',
      axis: {
        equality: 'Equality',
        markets: 'Markets',
        liberty: 'Liberty',
        authority: 'Authority',
        nation: 'Nation',
        globe: 'Globe',
        tradition: 'Tradition',
        progress: 'Progress'
      }
    },
    publicFigures: {
      elonmusk: 'Elon Musk',
      joebiden: 'Joe Biden',
      donaldtrump: 'Donald Trump'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Ha ocurrido un error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      save: 'Guardar',
      submit: 'Enviar',
      continue: 'Continuar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      search: 'Buscar',
      clear: 'Limpiar',
      share: 'Compartir'
    },
    settings: {
      title: 'Configuración',
      membership: {
        premium: 'Miembro Premium',
        basic: 'Miembro Básico',
        active: 'Activo',
        inactive: 'Inactivo',
        expiryDate: 'Fecha de Vencimiento',
        nextPayment: 'Tu próximo pago de membresía está programado para',
        noSubscription: 'Sin suscripción activa',
        upgrade: 'Actualizar a Awaken Pro',
        unlockFeatures: 'Desbloquea funciones avanzadas y contenido exclusivo'
      },
      items: {
        notifications: 'Notificaciones',
        darkTheme: 'Tema Oscuro',
        language: 'Idioma',
        privacyPolicy: 'Ver Política de Privacidad',
        helpCenter: 'Centro de Ayuda',
        reportIssue: 'Reportar un Problema'
      },
      signOut: 'Cerrar Sesión',
      signingOut: 'Cerrando sesión...'
    },
    home: {
      welcome: '¡Bienvenido de Nuevo!',
      todaysInsight: 'Sigue tu progreso y continúa tu viaje de autodescubrimiento',
      viewAll: 'Ver Todo',
      completedTests: 'Pruebas Completadas',
      noTestsYet: 'Aún no has completado pruebas',
      takeTest: 'Realizar una Prueba',
      verifyAccount: 'Verifica tu cuenta',
      dailyStreaks: 'Rachas Diarias',
      buildLearningPath: 'Construye tu camino',
      dailyChallenges: 'DESAFÍOS DIARIOS',
      comingSoon: 'Próximamente',
      verifyModal: {
        title: '¿Aún no verificado?',
        description: '¡Usa tu aplicación World ID para verificar tu identidad!',
        instruction: 'Simplemente toca "¡Verificar!" abajo y sigue las instrucciones para completar la verificación.',
        benefits: 'Al verificarte tendrás acceso a más funciones en la aplicación.',
        maybeLater: 'Quizás Después',
        verify: '¡Verificar!'
      }
    },
    signIn: {
      title: 'Iniciar Sesión',
      subtitle: 'Tu viaje hacia la comprensión de tu verdadero yo comienza aquí.',
      worldIdButton: 'World ID',
      connecting: 'Conectando...',
      privacyNotice: 'Al iniciar sesión, aceptas nuestra',
      privacyPolicy: 'Política de Privacidad',
      termsOfService: 'Términos de Servicio',
      and: 'y',
      walletAuthStatement: 'Inicia sesión con tu billetera Ethereum',
      headings: {
        firstLine: {
          prefix: 'Descubre Tu',
          words: {
            0: 'Verdad',
            1: 'Esencia',
            2: 'Espíritu',
            3: 'Alma',
            4: 'Corazón',
            5: 'Ser',
            6: 'Propósito'
          }
        },
        secondLine: {
          prefix: 'Transforma Tu',
          words: {
            0: 'Vista',
            1: 'Lente',
            2: 'Visión',
            3: 'Mente',
            4: 'Camino',
            5: 'Luz',
            6: 'Mundo'
          }
        }
      },
      errors: {
        authCancelled: 'La autenticación fue cancelada',
        authFailed: 'La autenticación falló',
        invalidSiweFormat: 'Error al crear el mensaje de autenticación. Por favor, inténtalo de nuevo.'
      }
    },
    register: {
      title: 'Conozcamos un poco sobre ti...',
      subtitle: 'Por favor completa los siguientes espacios para comenzar.',
      form: {
        name: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electrónico',
        age: 'Edad',
        country: 'País',
        submit: 'Completar Registro',
        selectAge: 'Seleccionar edad'
      }
    },
    welcome: {
      title: 'Bienvenido a tu viaje',
      greeting: '¡Hola, {{name}}!',
      description: 'Tu viaje de autodescubrimiento comienza ahora. Explora pruebas, obtén perspectivas y comprende mejor tu personalidad.',
      getStarted: 'Comenzar'
    },
    ideologyTest: {
      title: 'Prueba de Ideología',
      instructions: 'Por favor responde las siguientes preguntas honestamente para obtener resultados precisos.',
      questionCount: 'Pregunta {{current}} de {{total}}',
      options: {
        stronglyAgree: 'Totalmente de Acuerdo',
        agree: 'De Acuerdo',
        neutral: 'Neutral',
        disagree: 'En Desacuerdo',
        stronglyDisagree: 'Totalmente en Desacuerdo'
      },
      navigation: {
        next: 'Siguiente',
        previous: 'Anterior',
        finish: 'Finalizar Prueba'
      },
      leaveTest: 'Abandonar Prueba',
      leaveConfirmation: '¿Estás seguro de que quieres salir? Tu progreso será guardado.'
    },
    results: {
      title: 'Tus Resultados',
      summary: 'Perspectivas basadas en tus resultados',
      shareResults: 'Compartir Resultados',
      viewInsights: 'Ver Perspectivas',
      retakeTest: 'Repetir Prueba',
      scores: {
        economic: 'Económico',
        diplomatic: 'Diplomático',
        civil: 'Civil',
        societal: 'Social'
      }
    },
    insights: {
      title: 'Tus Perspectivas Ideológicas',
      description: 'Explora cómo tus valores se alinean en dimensiones ideológicas clave.',
      advancedInsights: 'Análisis Avanzados',
      unlockAdvancedInsights: 'Desbloquear Análisis Avanzados',
      shareResults: 'Compartir Resultados',
      noInsightsAvailable: 'No hay perspectivas disponibles. Por favor, inténtalo más tarde.',
      shareYourResults: 'Comparte Tus Resultados',
      advancedIdeologicalAnalysis: 'Análisis Ideológico Avanzado',
      unlockAdvancedInsightsTitle: 'Desbloquear Análisis Avanzados',
      proDescription: 'Profundiza en tu perfil ideológico con Awaken Pro. Obtén análisis completos y perspectivas personalizadas.',
      upgradeToPro: 'Actualizar a Pro',
      shareAnalysis: 'Compartir Análisis',
      perspective: 'Perspectiva',
      estimatedIdeology: 'Ideología Estimada',
      yourIdeology: 'Tu Ideología',
      closestPoliticalMatch: 'Tu Coincidencia Política Más Cercana',
      noMatchAvailable: 'Sin coincidencia disponible',
      basedOnAlignment: 'Basado en tu alineación política',
      tagAndShare: '¡Etiqueta a @MindVault y comparte tus resultados!',
      getFullExperience: 'La experiencia completa en WorldApp',
      ideologyNotAvailable: 'Ideología no disponible'
    },
    testSelection: {
      title: 'Pruebas Disponibles',
      description: 'Explora nuestra colección de pruebas para entenderte mejor',
      searchPlaceholder: 'Buscar pruebas...',
      ideologyTest: 'Prueba de Ideología',
      personalityTest: 'Prueba de Personalidad',
      startTest: 'Iniciar Prueba',
      achievementsSoon: '¡Logros próximamente! 🏆',
      moreSoon: '¡Más pruebas próximamente! 🎉'
    },
    leaderboard: {
      title: 'Tabla de Clasificación',
      description: 'Mira cómo te comparas con otros',
      rank: 'Posición',
      user: 'Usuario',
      score: 'Puntuación',
      comingSoon: 'Próximamente',
      comingSoonDescription: 'La función de tabla de clasificación está actualmente en desarrollo. ¡Vuelve pronto para competir con otros!',
      filter: {
        all: 'Todo el Tiempo',
        month: 'Este Mes',
        week: 'Esta Semana',
        day: 'Hoy'
      }
    },
    achievements: {
      title: 'Logros',
      description: 'Celebra tu progreso y descubre qué sigue en tu viaje',
      points: '{{current}}/{{max}} puntos',
      nextLevel: '¡Alcanza el siguiente nivel para desbloquear nuevas insignias y contenido exclusivo!',
      locked: 'Bloqueado',
      unlocked: 'Desbloqueado',
      progress: '{{current}}/{{total}} completados',
      comingSoon: 'Próximamente',
      comingSoonDescription: 'La función de logros está actualmente en desarrollo. ¡Vuelve pronto para celebrar tu progreso!'
    },
    awakenPro: {
      title: 'Da el Siguiente Paso',
      description: 'Desbloquea funciones y contenido premium',
      currentPlan: 'Plan actual:',
      popular: 'Popular',
      billingCycle: 'Por mes, facturado mensualmente',
      paymentDescription: 'Actualizar a Awaken Pro - Suscripción de 1 Mes',
      features: {
        advancedInsights: 'Análisis Avanzados',
        earlyAccess: 'Acceso anticipado a nuevas funciones',
        exclusiveCommunity: 'Acceso a Comunidad Exclusiva',
        prioritySupport: 'Soporte Prioritario',
        aiChat: 'Próximamente chat con IA',
        moreSoon: 'Más próximamente...'
      },
      pricing: {
        monthly: '3,50€/mes',
        yearly: '35€/año',
        lifetime: '99€ pago único'
      },
      subscribe: 'Actualizar a Pro',
      alreadySubscribed: 'Ya estás suscrito'
    },
    notFound: {
      title: 'Página No Encontrada',
      description: 'La página que estás buscando no existe.',
      backHome: 'Volver al Inicio'
    },
    tests: {
      instructions: {
        title: 'Descubre Tus Valores Políticos',
        beforeYouStart: 'Antes de comenzar',
        testDescription: 'Esta prueba consta de {{count}} declaraciones estimulantes diseñadas para explorar tus creencias políticas.',
        honestResponses: 'Por favor, responde honestamente, basándote en tus verdaderas opiniones.',
        estimatedTime: 'Tiempo Estimado',
        minutes: '{{count}} min',
        progress: 'Progreso',
        startTest: 'Iniciar prueba',
        continueTest: 'Continuar prueba'
      }
    },
    testCard: {
      progress: 'Progreso',
      ofTestCompleted: 'de la prueba completada',
      achievements: 'Logros',
      achievement: 'logro'
    },
    achievementCard: {
      obtainedOn: 'Obtenido el {{date}}'
    },
    toggle: {
      notificationsOn: 'Las notificaciones están habilitadas',
      notificationsOff: 'Las notificaciones están deshabilitadas',
      darkModeOn: 'El modo oscuro está habilitado',
      darkModeOff: 'El modo oscuro está deshabilitado'
    },
    profile: {
      level: 'Nivel',
      levelProgress: 'Progreso de nivel',
      pointsToLevelUp: '{{points}}/{{maxPoints}} puntos para subir de nivel',
      dailyMotivation: 'Tu motivación diaria'
    },
    ideology: {
      centrist: 'Centrista',
      moderate: 'Moderado',
      balanced: 'Equilibrado',
      neutral: 'Neutral',
      axis: {
        equality: 'Igualdad',
        markets: 'Mercados',
        liberty: 'Libertad',
        authority: 'Autoridad',
        nation: 'Nación',
        globe: 'Global',
        tradition: 'Tradición',
        progress: 'Progreso'
      }
    },
    publicFigures: {
      elonmusk: 'Elon Musk',
      joebiden: 'Joe Biden',
      donaldtrump: 'Donald Trump'
    }
  }
}; 