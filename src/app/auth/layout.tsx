import React, { ReactNode } from "react"

interface LayoutProps {
  readonly children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main>
        <div className="flex h-full lg:p-8">{children}</div>
    </main>
  )
}
