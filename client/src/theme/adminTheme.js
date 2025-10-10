// src/styles/theme.js
export const adminTheme = {
  templateName: "adminTheme",

  fonts: {
    main: "'Segoe UI', Arial, sans-serif",
    special: "'Playfair Display', serif",
    heading: "'Playfair Display', serif",
    body: "'Segoe UI', Arial, sans-serif",
    mono: "'Fira Code', monospace",
  },

  fontSizes: {
    base: "16px",
    xsmall: "14px",
    small: "16px",
    medium: "20px",
    large: "26px",
    xlarge: "32px",
    h1: "clamp(2.8rem, 7vw, 4.5rem)",
    h2: "2.5rem",
    h3: "2rem",
    xs: "0.8rem",
    sm: "0.9rem",
    md: "1.1rem",
    lg: "1.4rem",
    xl: "1.8rem",
    "2xl": "2.2rem",
    "3xl": "3rem",
  },

  fontWeights: {
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },

  lineHeights: {
    normal: "1.5",
    relaxed: "1.7",
    loose: "2",
  },

  spacings: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
    xxxl: "56px",
  },

  radii: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "20px",
    pill: "9999px",
    circle: "50%",
  },

  borders: {
    thin: "1px solid",
    thick: "2px solid",
  },

  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.03)",
    sm: "0 1px 4px rgba(0,0,0,0.05)",
    md: "0 4px 8px rgba(0,0,0,0.07)",
    lg: "0 8px 16px rgba(0,0,0,0.09)",
    xl: "0 16px 32px rgba(0,0,0,0.11)",
    form: "0 6px 20px rgba(0,0,0,0.06)",
    button: "0 2px 10px rgba(0,0,0,0.05)",
  },

  transition: {
    fast: "0.2s ease-in-out",
    normal: "0.3s ease-in-out",
    slow: "0.5s ease-in-out",
  },

  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  layout: {
    containerWidth: "1280px",
    sectionspacings: "3rem",
  },

  zIndex: {
    dropdown: 1000,
    modal: 1100,
    overlay: 1200,
    tooltip: 1300,
  },

  opacity: {
    disabled: 0.5,
    hover: 0.9,
  },

  breakpoints: {
    mobileS: "320px",
    mobileM: "375px",
    mobileL: "425px",
    tabletS: "600px",
    tablet: "768px",
    laptopS: "900px",
    laptop: "1024px",
    desktop: "1440px",
    desktopL: "1640px",
  },

  media: {
    xsmall: "@media (max-width: 480px)",
    small: "@media (max-width: 768px)",
    medium: "@media (max-width: 1024px)",
    large: "@media (max-width: 1440px)",
    xlarge: "@media (min-width: 1441px)",
    mobile: "@media (max-width: 768px)",
    tablet: "@media (min-width: 769px) and (max-width: 1024px)",
    desktop: "@media (min-width: 1025px)",
    landscape: "@media (orientation: landscape)",
    portrait: "@media (orientation: portrait)",
    retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
  },

  colors: {
    background: "#F8FAFF",
    backgroundSecondary: "#EDF4FB",
    backgroundAlt: "#FFFFFF",
    sectionBackground: "#FFFFFF",
    inputBackground: "#FFFFFF",
    inputBackgroundFocus: "#F0F4F8",
    footerBackground: "#F0F4F8",
    warningBackground: "#FFFBE6",
    contentBackground: "#F6F7FA",
    successBg: "#d1f5dd",
    dangerBg: "#ffe3e3",

    achievementBackground: "#EDF4FB",
    achievementGradientStart: "#2875c2",
    achievementGradientEnd: "#0bb6d6",

    overlayStart: "rgba(255,255,255,0.3)",
    overlayEnd: "rgba(255,255,255,0.97)",
    overlayBackground: "rgba(0,0,0,0.50)",
    skeleton: "#E8ECF3",
    skeletonBackground: "#EDF4FB",

    text: "#18335A",
    textAlt: "#2875c2",
    textSecondary: "#6c757d",
    textPrimary: "#2875c2",
    textMuted: "#8CA0B3",
    textLight: "#FFFFFF",
    title: "#18335A",
    textOnWarning: "#d95841",
    textOnSuccess: "#FFFFFF",
    textOnDanger: "#FFFFFF",

    primary: "#2875c2",
    primaryLight: "#52a6e4",
    primaryHover: "#205E9C",
    primaryDark: "#163D5C",
    primaryTransparent: "rgba(40,117,194,0.10)",

    secondary: "#23405B",
    secondaryLight: "#688EB3",
    secondaryHover: "#1a2d40",
    secondaryDark: "#112437",
    secondaryTransparent: "rgba(35,64,91,0.10)",

    accent: "#0bb6d6",
    accentHover: "#068ba6",
    accentText: "#FFFFFF",

    border: "#D3E3EF",
    borderLight: "#EDF4FB",
    borderBright: "#B5D2E8",
    borderBrighter: "#FFFFFF",
    borderHighlight: "#0bb6d6",
    borderInput: "#D3E3EF",

    card: "#FFFFFF",
    cardBackground: "#FFFFFF",

    buttonBackground: "#2875c2",
    buttonText: "#FFFFFF",
    buttonBorder: "#2875c2",

    link: "#0bb6d6",
    linkHover: "#2875c2",

    hoverBackground: "#F0F7FA",
    shadowHighlight: "0 0 0 3px rgba(11,182,214,0.13)",

    success: "#28C76F",
    warning: "#FFC107",
    warningHover: "#E0A800",
    danger: "#FF6B6B",
    dangerHover: "#E53935",
    error: "#FF6B6B",
    info: "#0bb6d6",

    muted: "#8CA0B3",
    disabled: "#D6D6D6",
    placeholder: "#B4C2D0",
    inputBorder: "#D3E3EF",
    inputBorderFocus: "#2875c2",
    inputOutline: "#2875c2",
    inputIcon: "#2875c2",
    inputBackgroundLight: "#F0F4F8",
    inputBackgroundSofter: "#EDF4FB",

    tableHeader: "#F0F0F0",
    tagBackground: "#E9DFC3",

    grey: "#7A8A92",
    darkGrey: "#163D5C",
    black: "#222B45",
    white: "#FFFFFF",
    whiteColor: "#FFFFFF",
    darkColor: "#163D5C",

    disabledBg: "#333333",
    lightGrey: "#F5F8FA",
  },

  buttons: {
    primary: {
      background: "#2875c2",
      backgroundHover: "#205E9C",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    secondary: {
      background: "#E9DFC3",
      backgroundHover: "#DCD2B4",
      text: "#222B45",
      textHover: "#0118D8",
    },
    success: {
      background: "#28C76F",
      backgroundHover: "#1E9A5B",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    warning: {
      background: "#FFC107",
      backgroundHover: "#E0A800",
      text: "#222B45",
      textHover: "#FFFFFF",
    },
    danger: {
      background: "#FF6B6B",
      backgroundHover: "#E53935",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
  },

  inputs: {
    background: "#FFFFFF",
    border: "#E9DFC3",
    borderFocus: "#2875c2",
    text: "#18335A",
    placeholder: "#7A8A92",
  },

  cards: {
    background: "#FFFFFF",
    hoverBackground: "#F0F0F0",
    border: "#E9DFC3",
    shadow: "0 4px 16px rgba(1,24,216,0.05)",
  },
};
