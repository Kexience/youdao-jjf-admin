export function Home({ title }: { title: string }) {
  return (
    <section>
      <h2>{title}</h2>
      <p>路由由 TanStack Router 文件式路由驱动，代码在 src/routes/ 下。</p>
    </section>
  )
}
