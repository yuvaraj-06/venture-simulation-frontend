/**
 * Share Ventures composed wordmark (foundations.md §2): the S logomark, then
 * lowercase "share" in Bold (700) and the descriptor in Light (300) — share
 * ventures for the firm, share OS (etc.) for products. Official fixed logo assets
 * remain unchanged. Renders entirely in currentColor
 * (black or white contexts only), so it transitions with the nav's solid state
 * instead of swapping image files. No hooks or client JS of its own — renders
 * from server components and inside client islands (Nav) alike.
 *
 * Size via the --sv-wordmark-size custom property (text size; default 21px):
 *   <Wordmark />                      → share ventures™
 *   <Wordmark product="OS" />        → share OS
 *   <Wordmark className="my-scope" /> with .my-scope { --sv-wordmark-size: 1.5rem }
 */

export default function Wordmark({
  product = 'ventures',
  tm = product.toLowerCase() === 'ventures',
  className,
}: {
  product?: string;
  tm?: boolean;
  className?: string;
}) {
  const displayProduct = product.toLowerCase() === 'ventures' ? 'ventures' : product;

  return (
    <span className={className ? `sv-wordmark ${className}` : 'sv-wordmark'}>
      {/* S paths from assets/logos/SV_Symbol_*.svg — official artwork, never redrawn */}
      <svg className="sv-wordmark__symbol" viewBox="125.85 116.8 828.3 933.4" aria-hidden="true">
        <path d="M414.15,448.29l414.15,239.11v62.53l-288.3,166.45-414.15-239.11v102.25c0,26.56,14.29,51.32,37.29,64.6l339.56,196.04c11.5,6.64,24.4,9.96,37.29,9.96s25.8-3.32,37.3-9.96l353.28-203.97c14.54-8.4,23.57-24.04,23.57-40.83v-180.62l-414.15-239.11-125.85,72.66Z" />
        <path d="M916.86,322.84l-339.56-196.04c-23.01-13.28-51.59-13.29-74.59,0l-345.4,199.41c-19.41,11.21-31.46,32.09-31.46,54.5v171.51l414.15,239.11,125.85-72.66-414.15-239.11v-62.53l288.3-166.45,414.15,239.11v-102.25c0-26.56-14.29-51.32-37.29-64.6Z" />
      </svg>
      <span className="sv-wordmark__text">
        <b className="sv-wordmark__share">share</b>{' '}
        <span className="sv-wordmark__product">
          {displayProduct}
          {tm && <span className="sv-wordmark__tm">™</span>}
        </span>
      </span>
    </span>
  );
}
