// ELITE GAME$ - subdomain router (Cloudflare Worker)
// Байхгүй subdomain (жишээ: abc.YOUR-DOMAIN.COM) руу орвол 404 хуудсыг харуулна.
//
// Тохиргоо:
//  1) DNS дээр wildcard бичлэг нэм:  Type A (эсвэл AAAA)  Name: *  -> 192.0.2.1  Proxy: ON (улбар шар үүл)
//  2) Worker Route нэм:  *.YOUR-DOMAIN.COM/*  -> энэ Worker
//  3) YOUR-DOMAIN.COM-г доор өөрийн домэйнээр солино.

const MAIN_HOSTS = ['YOUR-DOMAIN.COM', 'www.YOUR-DOMAIN.COM'];
const NOT_FOUND_URL = 'https://www.YOUR-DOMAIN.COM/404.html';

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
