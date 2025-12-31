/**
 * Rem's carefully designed English translation resources
 */
export const enUS = {
  // ============================================
  // Common (Global)
  // ============================================
  common: {
    appName: 'AI Assistant',
    version: 'v1.0.0',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    settings: 'Settings',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied',
    default: 'Default',
    enabled: 'Enabled',
    disabled: 'Disabled',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
  },

  // ============================================
  // Navigation Menu
  // ============================================
  nav: {
    general: 'General',
    providers: 'Providers',
    chat: 'Chat',
    memory: 'Memory',
    ui: 'Interface',
    network: 'Network',
    expand: 'Expand',
    collapse: 'Collapse',
  },

  // ============================================
  // Page: General Settings
  // ============================================
  generalSettings: {
    title: 'General Settings',
    subtitle: 'Manage app preferences and behavior',

    // Utility Model
    utilityModel: {
      sectionTitle: 'Utility Model',
      cardTitle: 'Select Utility Model',
      description: 'Fast model for automated tasks like title generation and memory operations',
      selectPlaceholder: 'Select a model',
      noModelsAvailable: 'No models available, please configure in Providers page first',
      testButton: 'Test Speed',
      testing: 'Testing...',

      // Test Results
      responseTime: 'Response Time',
      fast: '⚡ Fast',
      medium: '⚠️ Medium',
      slow: '🐌 Slow',

      currentSelection: 'Current utility model: {{modelName}}',
    },

    // Language Settings
    language: {
      sectionTitle: 'Language',
      displayName: 'Display Language',
      current: 'English (US)',
    },

    // Startup Settings
    startup: {
      sectionTitle: 'Startup Settings',
      launchOnStartup: 'Launch on Startup',
      launchOnStartupDesc: 'Automatically launch app when system starts',
      minimizeOnLaunch: 'Minimize to Tray on Launch',
      minimizeOnLaunchDesc: 'Minimize app to tray instead of showing main window after launch',
    },

    // Window Behavior
    window: {
      sectionTitle: 'Window Behavior',
      minimizeToTray: 'Minimize to System Tray',
      minimizeToTrayDesc: 'Hide to system tray instead of taskbar when minimizing',
      closeToTray: 'Close to System Tray',
      closeToTrayDesc: 'When enabled, close button will hide app to system tray instead of exiting',
    },

    // Quick Chat
    quickChat: {
      sectionTitle: 'Quick Chat',
      autoHideOnBlur: 'Auto Hide on Blur',
      autoHideOnBlurDesc: 'When enabled, Quick Chat window will auto hide when it loses focus',
    },
  },

  // ============================================
  // Page: User Interface
  // ============================================
  uiSettings: {
    title: 'Interface',
    subtitle: 'Personalize appearance and experience',

    // Theme Mode
    theme: {
      sectionTitle: 'Theme Mode',
      light: 'Light',
      lightDesc: 'Bright and clean interface',
      dark: 'Dark',
      darkDesc: 'Eye-friendly dark mode',
      system: 'System',
      systemDesc: 'Auto switch theme',
    },
  },

  // ============================================
  // Language Selector Component
  // ============================================
  languageSelector: {
    title: 'Select Language',
    changeLanguage: 'Change display language',
  },
} as const;
