// 간단한 클라이언트 사이드 라우터

type RouteHandler = (params?: Record<string, string>) => void

interface Route {
  pattern: RegExp
  handler: RouteHandler
  paramNames: string[]
}

class Router {
  private routes: Route[] = []
  private notFoundHandler: RouteHandler | null = null

  add(path: string, handler: RouteHandler): void {
    // :id 같은 파라미터를 정규식으로 변환
    const paramNames: string[] = []
    const pattern = path.replace(/:([\w]+)/g, (_, name) => {
      paramNames.push(name)
      return '([^/]+)'
    })

    this.routes.push({
      pattern: new RegExp(`^${pattern}$`),
      handler,
      paramNames
    })
  }

  setNotFound(handler: RouteHandler): void {
    this.notFoundHandler = handler
  }

  navigate(path: string): void {
    history.pushState(null, '', path)
    this.resolve()
  }

  resolve(): void {
    const path = window.location.pathname

    for (const route of this.routes) {
      const match = path.match(route.pattern)
      if (match) {
        const params: Record<string, string> = {}
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1]
        })
        route.handler(params)
        return
      }
    }

    if (this.notFoundHandler) {
      this.notFoundHandler()
    }
  }

  init(): void {
    // 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', () => {
      this.resolve()
    })

    // 초기 라우트 해결
    this.resolve()
  }
}

export const router = new Router()
