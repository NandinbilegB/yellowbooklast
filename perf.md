Yellow Book Гүйцэтгэл – 2025 оны 11 сар
Юу өөрчлөгдсөн бэ

/yellow-books хуудас одоо ISR (Incremental Static Regeneration) ашигладаг болсон бөгөөд revalidate = 60 гэж тохируулсан. Мөн категори болон контент жагсаалтууд нь <Suspense>-ийн цаана ачаалагддаг тул кэшлэгдсэн shell шууд харагдаж, өгөгдөл минут тутам шинэчлэгдэнэ.
(apps/web/src/app/yellow-books/page.tsx:45,100,109,226,276)

/yellow-books/[id] маршрут нь generateStaticParams болон cache tag-ууд ашиглан дэлгэрэнгүй хуудсуудыг урьдчилан үүсгэдэг, мөн /api/revalidate/yellow-books endpoint ашиглан бүх entries эсвэл зөвхөн нэг entry-г тусад нь revalidate хийх боломжтой.
(apps/web/src/app/yellow-books/[id]/page.tsx:24,31,45 болон apps/web/src/app/api/revalidate/yellow-books/route.ts:19–49)

/yellow-books/search нь зориуд цэвэр SSR (server-side rendering) горимоор тохируулагдсан — dynamic = "force-dynamic". MapClient нь client-side island хэвээр үлддэг. Map iframe нь <Suspense> дотор байрладаг тул жагсаалт эхэлж render хийгдэж, map дараа нь hydrate болдог.
(apps/web/src/app/yellow-books/search/page.tsx:4,8,46–58)

### Lab5-ийн өөрчлөлтүүд

- **/yellow-books**:
  - ISR (Incremental Static Regeneration) тохиргоог 60 секундээр тохируулсан.
  - Streamed section болон `<Suspense>` ашиглан TTFB болон LCP-г сайжруулсан.

- **/yellow-books/[id]**:
  - `generateStaticParams` ашиглан SSG тохиргоог сайжруулсан.
  - On-demand revalidation API зам нэмсэн (`/api/revalidate/yellow-books`).

- **/yellow-books/search**:
  - SSR болон client map island тохиргоог сайжруулсан.
  - MapClient-д илүү оновчтой fallback нэмсэн.

Хэмжилтүүд

Хэмжилтүүдийг production build-ийг:

PORT=4300 npm run start -w @yellbook/web
PORT=3000 npm run dev:web


коммандаар ажиллуулж, Lighthouse desktop preset ашиглан дараах байдлаар цуглуулсан:

npx lighthouse ... --only-categories=performance --preset=desktop \
  --chrome-flags="--headless --no-sandbox --disable-gpu"


Тайлан болон PNG зургууд tmp/ хавтсанд байгаа.

Route	Performance	TTFB	LCP	Артефактууд
/yellow-books	95	158 ms	0.74 s	tmp/lighthouse-yellow-books.report.{json,html}, tmp/lighthouse-yellow-books.png
/yellow-books/search	100	102 ms	0.60 s	tmp/lighthouse-yellow-books-search.report.{json,html}, tmp/lighthouse-yellow-books-search.png
Яагаад сайжрав?

ISR нь томоохон жагсаалтын өгөгдлийг edge дээр халуун кэштэй байлгана. Suspense streaming-тэй хосолсноор /yellow-books-ийн TTFB ~158 ms болж эрс бага болсон (локал API заримдаа удааширдаг ч гэсэн).

Search хуудсын query нь зөвхөн нэг удаа хийгдэж, серверийн жагсаалт болон client-side map-т хоёрдмол fetch хийхгүй болсон. Ингэснээр map дараа нь hydrate хийсэн ч LCP ~0.6 секунд болгож буурсан.

Дэлгэрэнгүй хуудсууд static бөгөөд cache-tag-аар удирдагддаг тул on-demand revalidate зарчмаар зөвхөн нэг хуудас шинэчлэгдэх боломжтой. Ингэснээр TTFB болон LCP тогтвортой хэвээр үлддэг.

Дараагийн эрсдэлүүд

Локал API одоо хоосон өгөгдөл буцааж байгаа тул Lighthouse-ийн LCP нь skeleton-аас хамаарч “хэт бага” гарч байна. Жинхэнэ өгөгдөлтэй backend-ээр дахин хэмжих шаардлагатай.

Lighthouse JSON/HTML/PNG тайлангуудыг CI дээр автоматаар нийтэлдэг болговол PR бүрт гүйцэтгэлийн бууралтыг шууд илрүүлнэ.

CMS/back-office-с хийсэн save үйлдлүүдийг /api/revalidate/yellow-books endpoint-т шууд холбосноор редакторууд гараар дуудлага хийх шаардлагагүй болно, мөн ISR cache хэзээ ч 60 секундээс илүү хоцрохгүй.