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
    <div class="bg-[#111111] border border-gray-800 rounded-xl p-6">
      <div class="flex justify-between items-start mb-4">
        <div class="skeleton h-6 w-32 rounded"></div>
        <div class="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div class="skeleton h-4 w-full rounded mb-2"></div>
      <div class="skeleton h-4 w-3/4 rounded mb-4"></div>
      <div class="flex justify-between items-center">
        <div class="skeleton h-4 w-20 rounded"></div>
        <div class="skeleton h-4 w-24 rounded"></div>
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
