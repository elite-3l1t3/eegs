// eegs.blog - subdomain router (Cloudflare Worker)
// Байхгүй subdomain (жишээ: abc.eegs.blog) руу орвол 404 хуудсыг харуулна.
// GitHub Pages өөрөө wildcard subdomain дэмждэггүй тул үүнийг Cloudflare дээр хийнэ.
//
// Урьдчилсан нөхцөл: eegs.blog-ийн DNS Cloudflare дээр байх (nameserver-ээ Cloudflare руу шилжүүлнэ).
//
// Тохиргоо:
//  1) DNS: apex (eegs.blog) болон www бичлэгүүд GitHub Pages руу "DNS only" (саарал үүл) хэвээр байна.
//  2) DNS: нэмэх бичлэг  Type A, Name: *, Content: 192.0.2.1, Proxy: ON (улбар шар үүл)
//     (GitHub-ийн github.io руу wildcard БҮҮ заа: domain takeover эрсдэлтэй)
//  3) Worker Route: *.eegs.blog/*  ->  энэ Worker

const MAIN_HOSTS = ['eegs.blog', 'www.eegs.blog'];
const NOT_FOUND_URL = 'https://eegs.blog/404.html';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Үндсэн сайт хэвээрээ ажиллана
    if (MAIN_HOSTS.includes(url.hostname)) return fetch(request);

    // Бусад бүх subdomain -> 404
    const page = await fetch(NOT_FOUND_URL);
    return new Response(page.body, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    });
  },
};
