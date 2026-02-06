// Global window extensions

interface Window {
  navigateTo: (path: string) => void
  showBandSettingsModal?: () => Promise<void>
  hideBandSettingsModal?: () => void
  confirmDeleteBand?: () => Promise<void>
  deleteInviteCodeConfirm?: (code: string) => Promise<void>
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void
}