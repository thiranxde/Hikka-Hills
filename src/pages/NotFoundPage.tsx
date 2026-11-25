import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { routes } from '@/config/routes'

export function NotFoundPage() {
  return (
    <section className="flex min-h-[80vh] items-center bg-forest-950 text-cream">
      <div className="shell pb-20 pt-36">
        <Eyebrow className="text-sand-200">Page not found</Eyebrow>
        <h1 className="mt-6 font-serif text-5xl font-light leading-[1.05] sm:text-7xl">
          This path leads <em className="font-light">nowhere.</em>
        </h1>
        <p className="mt-6 max-w-md text-cream/80">The page you were looking for is not here. The villa is.</p>
        <ButtonLink to={routes.home} variant="cream" className="mt-10">
          Back to Hikka Hills
        </ButtonLink>
      </div>
    </section>
  )
}
