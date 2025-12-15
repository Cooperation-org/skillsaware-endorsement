/**
 * SkillsAware Brand Color Constants
 *
 * These constants match the CSS variables defined in app/globals.css
 * Use these for:
 * - TypeScript/JavaScript code that needs color values
 * - PDF generation templates
 * - Email templates (where CSS variables aren't supported)
 * - Any place where you can't use CSS variables
 */

export const SKILLSAWARE_COLORS = {
  // Primary Colors
  primary: '#0b5fff',
  primaryDark: '#0052cc',
  primaryLight: '#2684ff',

  // Accent Colors
  accentPurple: '#6c5ce7',
  accentPurpleDark: '#5a4fcf',
  heroTeal: '#00d9ff',
  heroTealLight: '#e0f7fa',

  // Semantic Colors
  secondary: '#42526e',
  success: '#36b37e',
  warning: '#ffab00',
  error: '#de350b',
  info: '#0052cc',

  // Text Colors
  textPrimary: '#172b4d',
  textSecondary: '#42526e',
  textTertiary: '#6b778c',
  textInverse: '#ffffff',

  // Background Colors
  bgPrimary: '#ffffff',
  bgSecondary: '#f4f5f7',
  bgTertiary: '#ebecf0',
  bgHover: '#f4f5f7',

  // Border Colors
  border: '#dfe1e6',
  borderFocus: '#0b5fff',
  borderError: '#de350b',

  // Alert Background Colors
  alertSuccessBg: '#e3fcef',
  alertSuccessText: '#064e3b',
  alertErrorBg: '#ffebe6',
  alertErrorText: '#5e1a00',
  alertWarningBg: '#fff4e5',
  alertWarningText: '#5e3a00',
  alertInfoBg: '#e3fcef',
  alertInfoText: '#003d73',

  // Success Variants
  successDark: '#2e9d6b',
  successLight: '#e8f5e9',

  // Common Grays (for compatibility)
  gray100: '#f5f5f5',
  gray200: '#e0e0e0',
  gray300: '#cccccc',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#555555',
  gray700: '#333333'
} as const

/**
 * Helper function to get CSS variable name from color constant
 */
export function getCssVariable(colorKey: keyof typeof SKILLSAWARE_COLORS): string {
  const varMap: Record<keyof typeof SKILLSAWARE_COLORS, string> = {
    primary: '--skillsaware-primary',
    primaryDark: '--skillsaware-primary-dark',
    primaryLight: '--skillsaware-primary-light',
    accentPurple: '--skillsaware-accent-purple',
    accentPurpleDark: '--skillsaware-accent-purple-dark',
    heroTeal: '--skillsaware-hero-teal',
    heroTealLight: '--skillsaware-hero-teal-light',
    secondary: '--skillsaware-secondary',
    success: '--skillsaware-success',
    warning: '--skillsaware-warning',
    error: '--skillsaware-error',
    info: '--skillsaware-info',
    textPrimary: '--skillsaware-text-primary',
    textSecondary: '--skillsaware-text-secondary',
    textTertiary: '--skillsaware-text-tertiary',
    textInverse: '--skillsaware-text-inverse',
    bgPrimary: '--skillsaware-bg-primary',
    bgSecondary: '--skillsaware-bg-secondary',
    bgTertiary: '--skillsaware-bg-tertiary',
    bgHover: '--skillsaware-bg-hover',
    border: '--skillsaware-border',
    borderFocus: '--skillsaware-border-focus',
    borderError: '--skillsaware-border-error',
    alertSuccessBg: '--skillsaware-alert-success-bg',
    alertSuccessText: '--skillsaware-alert-success-text',
    alertErrorBg: '--skillsaware-alert-error-bg',
    alertErrorText: '--skillsaware-alert-error-text',
    alertWarningBg: '--skillsaware-alert-warning-bg',
    alertWarningText: '--skillsaware-alert-warning-text',
    alertInfoBg: '--skillsaware-alert-info-bg',
    alertInfoText: '--skillsaware-alert-info-text',
    successDark: '--skillsaware-success-dark',
    successLight: '--skillsaware-success-light',
    gray100: '--skillsaware-gray-100',
    gray200: '--skillsaware-gray-200',
    gray300: '--skillsaware-gray-300',
    gray400: '--skillsaware-gray-400',
    gray500: '--skillsaware-gray-500',
    gray600: '--skillsaware-gray-600',
    gray700: '--skillsaware-gray-700'
  }
  return varMap[colorKey] || ''
}
