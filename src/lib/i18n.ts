export type Locale = "en" | "es";

const translations = {
  en: {
    // Trust badge
    trustBadgePrivacy: "Your data never leaves your browser",
    trustBadgeFree: "Totally free",
    trustBadgeNoSignup: "No sign-up needed",

    // Hero
    heroLine1: "Stop chasing trials.",
    heroLine2: "Start reading your numbers.",
    heroBody: "Upload your Preply activity CSV and see what's actually driving your income:",
    heroTermRetention: "retention",
    heroTermPricing: "pricing",
    heroTermQuality: "student quality",
    heroBodyEnd: ", and where your time is really going.",
    heroTagline: "One file. Every insight you're missing.",
    heroPrivacy: "Your data is safe. Nothing is sent, saved, or stored anywhere.",
    heroCTA: "Analyze Your Data",
    heroDemo: "or explore the demo first",
    heroMadeBy: "Made by",
    heroMadeByEnd: ", a Preply tutor, for Preply tutors",

    // How it works
    howItWorksLabel: "How it works",
    howItWorksTitle: "Three steps. Under a minute.",
    step1Title: "Export from Preply",
    step1Desc: "Go to your tutor dashboard, download your activity report as a CSV. Takes 30 seconds.",
    step2Title: "Drop it here",
    step2Desc: "Drag your CSV into PreplyPulse. Everything runs in your browser. We never see your data.",
    step3Title: "See your business",
    step3Desc: "Retention, pricing gaps, revenue concentration, and reactivation targets. All of it, instantly.",

    // Upload
    uploadLabel: "Ready?",
    uploadTitle: "See your numbers",
    uploadSubtitle: "Your data stays on your device. Always.",
    uploadDrop: "Drop your Preply CSV here, or click to browse",
    uploadHint: "Export your tutor activity report from Preply and upload the CSV file",
    uploadButton: "Choose File",
    uploadProcessing: "Processing your data...",
    uploadPrivacy: "100% private. Processed in your browser, never sent to any server.",

    // CSV Guide
    guideToggle: "Not sure where to find your CSV?",
    guideStep1Title: "Go to your Insights page",
    guideStep1Desc: 'Log into Preply and click "Insights" in the top navigation bar.',
    guideStep2Title: "Find the Earnings section",
    guideStep2Desc: "Scroll down to the Earnings section and click the download icon.",
    guideStep3Title: "Download your CSV",
    guideStep3Desc: 'Set your start and end dates, select "CSV" as the file type, and click "Download report".',
    guideTip: "Tip: Set the start date as far back as possible for the most complete insights.",

    // Demo
    demoLabel: "Live preview",
    demoTitle: "See what you'll get",
    demoSubtitle: "This is anonymized sample data. Upload yours for the real thing.",
    demoBanner: "This is sample data. Upload yours to see your real insights.",
    demoEspresso: "If you found this helpful, consider",
    demoEspressoLink: "buying me an espresso",
    demoEspressoEnd: "to support the project. I built this for free because I think every tutor deserves to see their numbers clearly. The more caffeinated I am, the more helpful I am.",

    // Dashboard
    dashboardPrivacy: "Your data was processed entirely in your browser. Nothing was sent, saved, or stored anywhere.",
    downloadReport: "Download Report",
    downloadExporting: "Exporting...",
    uploadNewFile: "Upload New File",

    // Tabs
    tabOverview: "Overview",
    tabStudents: "Students",
    tabGrowth: "Growth",
    tabTrials: "Trials",
    tabActions: "Take Action",

    // Overview
    reportPeriod: "Report period:",
    totalStudents: "Total Students",
    totalLessons: "Total Lessons",
    totalEarnings: "Total Earnings",
    avgLessonPrice: "Avg Lesson Price",
    trialConversion: "Trial Conversion",
    active30d: "Active (30d)",
    paid: "paid",
    gross: "gross",
    dormant180d: "dormant 180d+",
    whatStandsOut: "What stands out",

    // Students
    studentSummary: "Student Summary",
    geographicBreakdown: "Geographic Breakdown",
    concentrationRisk: "Concentration Risk",
    searchStudents: "Search students...",
    showing: "Showing",
    of: "of",
    students: "students",

    // Growth
    monthlyTrends: "Monthly Trends",
    seasonality: "Seasonality",
    revenueForecast: "Revenue Forecast",
    earningsAndPrice: "Earnings & Avg Price",
    activeStudentsAndLessons: "Active Students & Lessons",

    // Trials
    trialFunnel: "Trial Funnel",
    speedToBook: "Speed to Book",
    ltvCurve: "Student Lifetime Value Curve",
    totalTrials: "Total Trials",
    conversionRate: "Conversion Rate",
    converted: "Converted",
    conversionByMonth: "Conversion by Month",
    byWeekday: "By Weekday",
    byTimeOfDay: "By Time of Day",

    // Actions
    reactivationOpportunities: "Reactivation Opportunities",
    pricingOpportunities: "Pricing Opportunities",
    schedulingPatterns: "Scheduling Patterns",

    // Footer
    builtBy: "Built by Megan B.",
    footerLessons: "lessons taught who built this tool so you don't have to figure out the business side alone.",
    footerBuyMeCoffee: "Buy me a coffee",
    footerPrivacy: "Privacy & verification",
    footerSource: "View source",
    footerCommit: "Deployed commit",
    footerReddit: "Read the Reddit post",
    footerDisclaimer: "PreplyPulse is not affiliated with Preply. Your data is processed entirely in your browser.",

    // Insights
    insightStrongConversion: "Strong trial conversion",
    insightWeakConversion: "Trial conversion needs attention",
    insightSpeedMatters: "Speed matters",
    insightConcentration: "Revenue concentration",
    insightPricingUp: "Pricing is trending up",
    insightPricingDown: "Pricing is trending down",
    insightReactivation: "Reactivation opportunity",
    insightLegacyPricing: "Legacy pricing drag",
    insightGeo: "Geographic sweet spot",
    insightRepeatStrong: "Strong repeat booking",
    insightRepeatWeak: "Repeat booking rate",
  },

  es: {
    trustBadgePrivacy: "Tus datos nunca salen de tu navegador",
    trustBadgeFree: "Totalmente gratis",
    trustBadgeNoSignup: "Sin registro",

    heroLine1: "Deja de perseguir pruebas.",
    heroLine2: "Empieza a leer tus numeros.",
    heroBody: "Sube tu CSV de actividad de Preply y descubre que esta impulsando tus ingresos:",
    heroTermRetention: "retencion",
    heroTermPricing: "precios",
    heroTermQuality: "calidad de estudiantes",
    heroBodyEnd: ", y a donde va realmente tu tiempo.",
    heroTagline: "Un archivo. Cada dato que te estas perdiendo.",
    heroPrivacy: "Tus datos estan seguros. Nada se envia, guarda ni almacena.",
    heroCTA: "Analiza tus datos",
    heroDemo: "o explora la demo primero",
    heroMadeBy: "Creado por",
    heroMadeByEnd: ", tutora de Preply, para tutores de Preply",

    howItWorksLabel: "Como funciona",
    howItWorksTitle: "Tres pasos. Menos de un minuto.",
    step1Title: "Exporta desde Preply",
    step1Desc: "Ve a tu panel de tutor, descarga tu informe de actividad como CSV. Toma 30 segundos.",
    step2Title: "Suelta el archivo aqui",
    step2Desc: "Arrastra tu CSV a PreplyPulse. Todo se procesa en tu navegador. Nunca vemos tus datos.",
    step3Title: "Ve tu negocio",
    step3Desc: "Retencion, brechas de precios, concentracion de ingresos y oportunidades de reactivacion. Todo, al instante.",

    uploadLabel: "Listo?",
    uploadTitle: "Ve tus numeros",
    uploadSubtitle: "Tus datos se quedan en tu dispositivo. Siempre.",
    uploadDrop: "Suelta tu CSV de Preply aqui, o haz clic para buscar",
    uploadHint: "Exporta tu informe de actividad de tutor desde Preply y sube el archivo CSV",
    uploadButton: "Elegir archivo",
    uploadProcessing: "Procesando tus datos...",
    uploadPrivacy: "100% privado. Procesado en tu navegador, nunca enviado a ningun servidor.",

    guideToggle: "No sabes donde encontrar tu CSV?",
    guideStep1Title: "Ve a tu pagina de Insights",
    guideStep1Desc: 'Inicia sesion en Preply y haz clic en "Insights" en la barra de navegacion.',
    guideStep2Title: "Encuentra la seccion de Ganancias",
    guideStep2Desc: "Desplazate hasta la seccion de Ganancias y haz clic en el icono de descarga.",
    guideStep3Title: "Descarga tu CSV",
    guideStep3Desc: 'Establece las fechas de inicio y fin, selecciona "CSV" como tipo de archivo y haz clic en "Download report".',
    guideTip: "Consejo: Establece la fecha de inicio lo mas atras posible para obtener los datos mas completos.",

    demoLabel: "Vista previa",
    demoTitle: "Mira lo que obtendras",
    demoSubtitle: "Estos son datos de ejemplo anonimizados. Sube los tuyos para ver los reales.",
    demoBanner: "Estos son datos de ejemplo. Sube los tuyos para ver tus datos reales.",
    demoEspresso: "Si esto te resulto util, considera",
    demoEspressoLink: "invitarme un espresso",
    demoEspressoEnd: "para apoyar el proyecto. Construi esto gratis porque creo que cada tutor merece ver sus numeros con claridad. Mientras mas cafeina tengo, mas ayudo.",

    dashboardPrivacy: "Tus datos se procesaron completamente en tu navegador. Nada fue enviado, guardado ni almacenado.",
    downloadReport: "Descargar informe",
    downloadExporting: "Exportando...",
    uploadNewFile: "Subir nuevo archivo",

    tabOverview: "Resumen",
    tabStudents: "Estudiantes",
    tabGrowth: "Crecimiento",
    tabTrials: "Pruebas",
    tabActions: "Acciones",

    reportPeriod: "Periodo del informe:",
    totalStudents: "Total de estudiantes",
    totalLessons: "Total de lecciones",
    totalEarnings: "Ganancias totales",
    avgLessonPrice: "Precio promedio",
    trialConversion: "Conversion de pruebas",
    active30d: "Activos (30d)",
    paid: "pagadas",
    gross: "bruto",
    dormant180d: "inactivos 180d+",
    whatStandsOut: "Lo mas destacado",

    studentSummary: "Resumen de estudiantes",
    geographicBreakdown: "Distribucion geografica",
    concentrationRisk: "Riesgo de concentracion",
    searchStudents: "Buscar estudiantes...",
    showing: "Mostrando",
    of: "de",
    students: "estudiantes",

    monthlyTrends: "Tendencias mensuales",
    seasonality: "Estacionalidad",
    revenueForecast: "Pronostico de ingresos",
    earningsAndPrice: "Ganancias y precio promedio",
    activeStudentsAndLessons: "Estudiantes activos y lecciones",

    trialFunnel: "Embudo de pruebas",
    speedToBook: "Velocidad de reserva",
    ltvCurve: "Curva de valor de vida del estudiante",
    totalTrials: "Total de pruebas",
    conversionRate: "Tasa de conversion",
    converted: "Convertidos",
    conversionByMonth: "Conversion por mes",
    byWeekday: "Por dia de la semana",
    byTimeOfDay: "Por hora del dia",

    reactivationOpportunities: "Oportunidades de reactivacion",
    pricingOpportunities: "Oportunidades de precios",
    schedulingPatterns: "Patrones de horarios",

    builtBy: "Creado por Megan B.",
    footerLessons: "lecciones impartidas, quien creo esta herramienta para que no tengas que descifrar el lado empresarial solo/a.",
    footerBuyMeCoffee: "Invitame un cafe",
    footerPrivacy: "Privacidad y verificacion",
    footerSource: "Ver codigo fuente",
    footerCommit: "Commit desplegado",
    footerReddit: "Lee el post en Reddit",
    footerDisclaimer: "PreplyPulse no esta afiliado a Preply. Tus datos se procesan completamente en tu navegador.",

    insightStrongConversion: "Conversion de pruebas solida",
    insightWeakConversion: "La conversion de pruebas necesita atencion",
    insightSpeedMatters: "La velocidad importa",
    insightConcentration: "Concentracion de ingresos",
    insightPricingUp: "Los precios van en aumento",
    insightPricingDown: "Los precios van en descenso",
    insightReactivation: "Oportunidad de reactivacion",
    insightLegacyPricing: "Precios antiguos rezagados",
    insightGeo: "Zona geografica clave",
    insightRepeatStrong: "Reservas recurrentes solidas",
    insightRepeatWeak: "Tasa de reservas recurrentes",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key];
}

export const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
];
