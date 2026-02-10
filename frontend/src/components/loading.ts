// Loading components

export function renderLoadingSpinner(): string {
  return `
    <div style="display: flex; align-items: center; justify-content: center; padding: 3rem 0;">
      <div class="spinner"></div>
    </div>
  `
}

export function renderSkeletonCard(): string {
  return `
    <div class="card" style="animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div style="height: 2rem; width: 10rem; background: #e5e5e5; border-radius: 0.5rem;"></div>
        <div style="height: 1.75rem; width: 4rem; background: #e5e5e5; border-radius: 9999px;"></div>
      </div>
      <div style="height: 1rem; width: 100%; background: #e5e5e5; border-radius: 0.5rem; margin-bottom: 0.5rem;"></div>
      <div style="height: 1rem; width: 75%; background: #e5e5e5; border-radius: 0.5rem; margin-bottom: 1.5rem;"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #e5e5e5;">
        <div style="height: 1rem; width: 5rem; background: #e5e5e5; border-radius: 0.5rem;"></div>
        <div style="height: 1rem; width: 7rem; background: #e5e5e5; border-radius: 0.5rem;"></div>
      </div>
    </div>
  `
}

export function renderSkeletonGrid(count: number = 3): string {
  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); gap: 2rem;">
      ${Array.from({ length: count }, () => renderSkeletonCard()).join('')}
    </div>
  `
}
