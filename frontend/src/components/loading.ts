// Loading components

export function renderLoadingSpinner(): string {
  return `
    <div class="flex items-center justify-center py-12">
      <div class="spinner"></div>
    </div>
  `
}

export function renderSkeletonCard(): string {
  return `
    <div class="bg-white border border-neutral-200 rounded-2xl p-8 animate-pulse">
      <div class="flex justify-between items-start mb-4">
        <div class="h-6 w-32 bg-neutral-200 rounded"></div>
        <div class="h-6 w-16 bg-neutral-200 rounded-full"></div>
      </div>
      <div class="h-4 w-full bg-neutral-200 rounded mb-2"></div>
      <div class="h-4 w-3/4 bg-neutral-200 rounded mb-4"></div>
      <div class="flex justify-between items-center pt-4 border-t border-neutral-200">
        <div class="h-4 w-20 bg-neutral-200 rounded"></div>
        <div class="h-4 w-24 bg-neutral-200 rounded"></div>
      </div>
    </div>
  `
}

export function renderSkeletonGrid(count: number = 3): string {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${Array.from({ length: count }, () => renderSkeletonCard()).join('')}
    </div>
  `
}
