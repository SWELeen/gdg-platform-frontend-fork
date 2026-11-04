# تشغيل الواجهة محليًا وعلى Render

## تشغيل محلي

1. في `gdg-main-platform-backend` شغّل الباكند وقاعدة البيانات المحلية عبر Docker Compose:

   ```powershell
   docker compose up --build backend
   ```

   هذا يشغّل PostgreSQL والباكند على `http://localhost:3001`، ويستخدم قاعدة Docker المحلية بدل عنوان قاعدة البيانات في `.env`.

2. في `gdg-main-platform-frontend`:

   ```powershell
   pnpm install
   pnpm dev
   ```

3. افتح `http://localhost:3000`. ملف `.env.local` المحلي يوجه `/api/*` إلى `http://localhost:3001`. لا تستخدم `pnpm dev` مع إعدادات Render؛ لكل بيئة متغيراتها.

## إعداد Render

الخدمتان منفصلتان: أنشئ لكل repository خدمة **Web Service** (وليس Static Site)، وشغّل Next.js كخادم Node حتى تعمل إعادة توجيه `/api`.

### Frontend service

- Root directory: جذر `gdg-main-platform-frontend`.
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- اضبط المتغيرات قبل البناء:
  - `NEXT_PUBLIC_USE_API=true`
  - `API_PROXY_TARGET=https://<backend-service>.onrender.com`

### Backend service

- Root directory: جذر `gdg-main-platform-backend`.
- Build command: `corepack enable && corepack prepare pnpm@12.3.4 --activate && pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start:prod`
- قبل التشغيل، طبّق migrations عبر Pre-Deploy Command: `pnpm prisma:migrate:deploy` إذا كانت الخطة تدعمه. وإلا استخدم Start command: `pnpm prisma:migrate:deploy && pnpm start:prod`.
- اضبط `NODE_VERSION=24.20.0` و`NODE_ENV=production`، `FRONTEND_URL=https://<frontend-service>.onrender.com`، وقيم الإنتاج الفعلية لـ`DATABASE_URL` وSupabase وبقية الإعدادات المطلوبة. Render يمرر `PORT` تلقائيًا؛ لا تثبته على `3001` في الإنتاج.

`FRONTEND_URL` لازم يطابق أصل موقع الواجهة حرفيًا، بدون مسار. لا تضع أسرار الباكند في إعدادات الواجهة أو في أي متغير يبدأ بـ`NEXT_PUBLIC_`. لا تعدّل `.env.local` لتشغيل Render؛ إعدادات الخدمة محفوظة في Render منفصلة عن إعداد localhost.

## التحقق من الاتصال

- محليًا: افتح أدوات المطور > Network وتأكد أن الطلبات تذهب إلى `http://localhost:3000/api/...`، وأن خدمة الباكند تعمل على المنفذ `3001`.
- على Render: افتح نفس المسارات من واجهة Render؛ يجب أن تمر من نطاق الواجهة عبر `/api`، بينما `API_PROXY_TARGET` يشير إلى خدمة الباكند.
- استخدم `pnpm check` لفحوصات الواجهة و`pnpm build` لبناء الإنتاج.
