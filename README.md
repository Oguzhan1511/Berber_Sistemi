# Village Berber

Berber işletmeleri için tanıtım sitesi, fotoğraflı çalışan seçimi, randevu formu ve yönetim paneli.

## Özellikler

- Hizmet, fiyat, çalışan ve çalışma saati yönetimi
- Berbere ve tarihe göre uygun saatler; eşzamanlı çift rezervasyon koruması
- Çalışan fotoğrafları ve fotoğraf vitrini
- Haftalık randevu takvimi ve WhatsApp üzerinden talep iletimi
- Supabase PostgreSQL ve özel fotoğraf deposu
- Randevu tarihinden 14 gün sonra otomatik kayıt temizliği

## Yerelde çalıştırma

Node.js 22.13 veya üstünü kullanın.

```sh
npm run install:ci
cp .dev.vars.example .dev.vars
npm run dev
```

Site: http://127.0.0.1:5173 — Yönetim paneli: http://127.0.0.1:5173/berber

`.dev.vars` içindeki `SUPABASE_URL` ve `SUPABASE_SECRET_KEY` değerlerini kendi projenize göre doldurun. Yerel yönetim girişi için `BARBER_ADMIN_EMAIL=seedy@sites.test` kullanılır. Canlı ortamda bu değeri yetkili yöneticinin e-posta adresiyle değiştirin.

Supabase veritabanı kurulumu ve erişim kuralları [supabase/README.md](supabase/README.md) dosyasındadır. Supabase anahtarı boş bırakılırsa geliştirme ortamında D1/R2 kullanılır; bu mod için yerel veritabanı şemasının da kurulması gerekir. Çalışan verileri, müşteri kayıtları, fotoğraf dosyaları ve gerçek anahtarlar bu repoya dahil edilmez.

## Kontroller

```sh
node node_modules/typescript/bin/tsc --noEmit
node tests/availability.test.mjs
npm run build
```

## Teknoloji

React, TypeScript, Vinext/Vite, Cloudflare Workers ve Supabase. Framework ve çalışma ortamı hakkında ek notlar: [docs/sites-runtime.md](docs/sites-runtime.md).

Gizli anahtarları `NEXT_PUBLIC_` değişkenlerine veya istemci koduna eklemeyin. Üretimde ortam değerlerini sunucu tarafındaki gizli değişkenler olarak yapılandırın. Yerel geliştirme girişini canlı ortamda etkinleştirmeyin.

## Vercel

Müşteri bağlantısı `/`, berber bağlantısı `/berber` yolundadır. Vercel kurulumu için [docs/vercel.md](docs/vercel.md) dosyasına bakın. Canlı berber paneli kullanıcı adı ve şifreyle korunur; yönetici bilgileri yalnızca sunucu ortam değişkenlerinde tutulur.
