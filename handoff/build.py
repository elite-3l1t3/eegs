# ELITE GAME$ site generator.  Usage (from the repo root):  python3 handoff/build.py .
# Generates index.html, 4 game pages, terms/, privacy/, 404.html, assets/en.js. news.json is created only if missing.
import html,json,os,re,sys
O=(sys.argv[1] if len(sys.argv)>1 else '.').rstrip('/')+'/';D='https://eegs.blog/'
V='20261115'  # asset version: change it when app.css / app.js / en.js change so browsers fetch the new files
EN={}
def t(m,e):
    k=m.strip()
    if k in EN and EN[k]!=e:raise SystemExit(f'Translation conflict for {k!r}: {EN[k]!r} vs {e!r}')
    EN[k]=e;return m
def a(s):return html.escape(s,quote=True)
ROB='https://www.roblox.com/communities/35654822/ELITE-GAME';DISC='https://discord.gg/s7nmDDhu8E';TT='https://www.tiktok.com/@devnamedelite'
OGI=D+'assets/img/og-image.png'
# slug = short page address (eegs.blog/mtt/), old = previous long address (still works, redirects to slug)
# uid = Roblox universe id (used for the live numbers), pid = place id (used for links)
GAMES=[
 dict(slug='mtt',old='mongolia-troll-tower',name='Mongolia Troll Tower',pid='88290581472538',uid='7606658236',img='troll-tower.webp',tag=('Хамгийн алдартай','Most popular'),
  mn='Монголын анхны Tower! Троллуудаас зайлсхийж цамхгийг дуусгаж чадах уу? Оюун ухаан, хурдаараа бүх саадыг даван оройд хүр.',
  en="Mongolia's first Tower! Can you dodge the trolls and finish the tower? Use your brains and speed to get past every obstacle and reach the top."),
 dict(slug='mh',old='mongolia-hangout',name='Mongolia Hangout',pid='131034880555553',uid='8509544802',img='hangout.webp',tag=('Анхны тоглоом','First game'),
  mn='Хамт цугларах газар. Шинэ хүмүүстэй танилцаж, уулзалт зохион байгуулж, Монголын хамт олны уур амьсгалыг мэдрээрэй.',
  en='A place to hang out together. Meet new people, host gatherings and feel the spirit of the Mongolian community.'),
 dict(slug='mtt2',old='mongolia-troll-tower-2',name='Mongolia Troll Tower 2',pid='131704942195149',uid='7883093131',img='troll-tower-2.webp',tag=None,
  mn='Troll Tower-ийн хоёр дахь хэсэг. Троллуудаас зайлсхийж цамхгийг дуусгаад оройд хүр.',
  en='The second part of Troll Tower. Dodge the trolls, finish the tower and reach the top.'),
 dict(slug='mst',old='mongolia-slap-tower',name='Mongolia Slap Tower',pid='126247610208410',uid='7717729199',img='slap-tower.webp',tag=None,
  mn='Саад бүрийг давж цамхгийн оройд хүрэх хурд, оюун ухааны сорилт.',
  en='A test of speed and wit: get past every obstacle and reach the top of the tower.'),
]
for g in GAMES:g['url']=f"https://www.roblox.com/games/{g['pid']}/{g['name'].replace(' ','-')}"
UIDS=','.join(g['uid'] for g in GAMES)
# (Roblox user id, display name, role, fallback letter). Find an id: roblox.com/users/<ID>/profile
TEAM=[('3601979038','eliteBX','CEO & Founder','E'),('590855591','RobloxMongolia','CFO','R'),('7259515579','Trust_me369','Developer','T'),
 ('928064574','enxv4','Environment Artist & Developer','E'),('5673840754','ihmuukin87','Modeler, Map Builder & Developer','I'),('4327608043','1imin6','Animator & Developer','1')]
NAV=[('games','Тоглоом','Games'),('story','Түүх','Story'),('team','Баг','Team'),('card','ID карт','ID card'),('news','Мэдээ','News'),('faq','Асуулт','FAQ')]
FAQ=[
 ('ELITE GAME$ гэж юу вэ?','What is ELITE GAME$?','Монголын Roblox хамт олон. Roblox дээр 290K гаруй гишүүнтэй, Mongolia Troll Tower, Mongolia Hangout зэрэг тоглоомыг өөрсдөө бүтээдэг. Roblox дээр "ELITE GAME$" гэж хайвал олно.','A Mongolian Roblox community with over 290K members on Roblox. We build our own games such as Mongolia Troll Tower and Mongolia Hangout. Search "ELITE GAME$" on Roblox to find us.'),
 ('eliteBX болон DevNamedElite хоёр хэн бэ?','Who are eliteBX and DevNamedElite?','Нэг хүн. eliteBX нь ELITE GAME$-ийн CEO, үүсгэн байгуулагч бөгөөд өмнөх Roblox нэр нь DevNamedElite. TikTok хаяг нь @devnamedelite.','The same person. eliteBX is the CEO and founder of ELITE GAME$, and his previous Roblox name was DevNamedElite. His TikTok is @devnamedelite.'),
 ('Mongolia Troll Tower-ийг хаанаас тоглох вэ?','Where can I play Mongolia Troll Tower?','Roblox дээр. "Тоглоом" хэсгээс "Тоглох" товчийг дарна. Утас болон компьютер дээр Roblox апп эсвэл Roblox Player хэрэгтэй.','On Roblox. Press "Play" in the Games section. You need the Roblox app or Roblox Player on a phone or computer.'),
 ('Хамт олонд хэрхэн нэгдэх вэ? Төлбөртэй юу?','How do I join? Does it cost anything?','Төлбөргүй. Roblox дээрх групп руу орж Join дарна, мөн Discord сервер рүү нэгдэж болно.','It is free. Open the group on Roblox and press Join, and you can also join our Discord server.'),
 ('Тоглоомуудыг хэн бүтээдэг вэ?','Who makes the games?','"Манай баг" хэсэгт нэрлэсэн хүмүүс: хөгжүүлэгч, орчны зураач, загвар болон газрын зураг бүтээгч, animator.','The people listed in "Our team": developers, an environment artist, a modeler and map builder, and an animator.'),
 ('Энэ сайт албан ёсных уу? Roblox-той холбоотой юу?','Is this site official? Is it connected to Roblox?','Энэ нь ELITE GAME$-ийн албан ёсны сайт. Харин Roblox Corporation-тэй холбоогүй бөгөөд Roblox нь тэдний барааны тэмдэг.','This is the official ELITE GAME$ website. It is not connected to Roblox Corporation, and Roblox is their trademark.'),
]
FIX=[('Roblox community-ийн','Roblox хамт олны'),('community-ийн','хамт олны'),('Roblox community','Roblox хамт олон'),('айзийн статистик (жишээ нь хэдэн хүн зочилсон)','зочдын статистик (жишээ нь хэдэн хүн орсон)'),
 ('<li>Энэ сайтад орсон тоо (зочлолтын тоолуур)</li>',''),('Хэл сонголт (Монгол/Англи) ба дууны тохиргоо (SFX идэвхтэй эсэх)','Хэл сонголт (Монгол/Англи), багийн гишүүдийн avatar зургийн түр хадгалалт')]
def legal(p):
    s=open(O+p+'/index.html',encoding='utf8').read()
    m=re.search(r'<article class="legal[^>]*>(.*?)</article>',s,re.S)
    if m:x=m.group(1)
    else:
        x=re.search(r'(<h1.*?)(?=<div class="btns")',s,re.S).group(1)
        x=re.sub(r'\s*style="[^"]*"','',x).replace(' class="steps"','')
    for o,n in FIX:x=x.replace(o,n)
    return x.replace('<p data-enonly class="mut">The legal text is available in Mongolian only.</p>','')
LEG={p:legal(p) for p in ('terms','privacy')}

def header(r):
    nav=''.join(f'<a href="{r}#{h}">{t(m,e)}</a>' for h,m,e in NAV)
    return f'''<header class="top"><div class="wrap bar"><a class="brand" href="{r}#top" aria-label="{a(t('ELITE GAME$ нүүр хуудас','ELITE GAME$ home'))}"><img src="{r}assets/img/logo-mark.webp" width="36" height="37" alt="">ELITE GAME$</a>
<nav aria-label="{a(t('Үндсэн цэс','Main menu'))}">{nav}</nav>
<div class="hr"><button class="lang" id="lang" type="button" data-nt>EN</button><a class="btn pri" href="{DISC}" target="_blank" rel="noopener">Discord</a></div></div></header>'''
def footer(r):
    return f'''<footer><div class="wrap"><p>{t('© 2026 ELITE GAME$. Албан ёсны вэбсайт. Roblox нь Roblox Corporation-ийн барааны тэмдэг бөгөөд энэ сайт тэдэнтэй холбоогүй.','© 2026 ELITE GAME$. Official website. Roblox is a trademark of Roblox Corporation and this site is not affiliated with it.')}</p>
<p><a href="{r}terms/">{t('Үйлчилгээний нөхцөл','Terms of Service')}</a> {t('ба','and')} <a href="{r}privacy/">{t('Нууцлалын бодлого','Privacy Policy')}</a></p></div></footer>'''
def page(slug,ti,de,inner,ld,r='',main=''):
    ti=t(*ti);de=t(*de)
    return f'''<!DOCTYPE html>
<html lang="mn" data-root="{r}" data-uids="{UIDS}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<script>document.documentElement.className='js'</script>
<title>{a(ti)}</title>
<meta name="description" content="{a(de)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#050b16">
<link rel="canonical" href="{D}{slug}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ELITE GAME$">
<meta property="og:locale" content="mn_MN">
<meta property="og:url" content="{D}{slug}">
<meta property="og:title" content="{a(ti)}">
<meta property="og:description" content="{a(de)}">
<meta property="og:image" content="{OGI}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{OGI}">
<link rel="manifest" href="{r}manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="{r}assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="{r}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://eegs.e05729613.workers.dev" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">{json.dumps({"@context":"https://schema.org","@graph":ld},ensure_ascii=False)}</script>
<link rel="stylesheet" href="{r}assets/app.css?v={V}">
</head>
<body>
<a class="skip" href="#main">{t('Үндсэн хэсэг рүү шилжих','Skip to main content')}</a>
<div class="bgfx" aria-hidden="true"><i></i><i></i></div>
{header(r)}
<main id="main"{main}>
{inner}
</main>
{footer(r)}
<script src="{r}assets/en.js?v={V}"></script>
<script src="{r}assets/app.js?v={V}"></script>
</body>
</html>
'''
def btn_play(g,cls='pri'):
    return f'<a class="btn {cls}" href="{g["url"]}" target="_blank" rel="noopener" aria-label="{a(t("%s тоглох"%g["name"],"Play %s"%g["name"]))}">{t("Тоглох","Play")}</a>'
def live_st(extra=''):
    # live connection status line; app.js fills #lsm
    return f'<p class="lst{extra}" id="lst" role="status"><i aria-hidden="true"></i><span id="lsm">{t("Roblox-оос мэдээлэл авч байна...","Getting data from Roblox...")}</span></p>'
def pill():
    return f'<span class="pill" hidden><i aria-hidden="true"></i><b class="pl">0</b> <span>{t("онлайн","online")}</span></span>'
def lv():
    return f'<p class="lv" hidden><span><b class="pl">0</b> <span>{t("тоглож байна","playing")}</span></span><span><b class="vs">-</b> <span>{t("удаа орсон","visits")}</span></span><span><b class="fv">-</b> <span>{t("дуртай","favorites")}</span></span></p>'
def game_li(g,big=False):
    tag=f'<span class="tag">{t(*g["tag"])}</span>' if g['tag'] else ''
    return f'''<li class="game{' big' if big else ''} rv" data-p="{g['pid']}"><div class="shot"><img src="assets/img/{g['img']}" width="768" height="432" alt="{a(t(g['name']+' тоглоомын зураг',g['name']+' game image'))}" loading="lazy" decoding="async">{pill()}</div><div class="gb">{tag}<h3>{g['name']}</h3><p class="sel">{t(g['mn'],g['en'])}</p>{lv()}<div class="row">{btn_play(g)}<a class="btn" href="{g['slug']}/" aria-label="{a(t(g['name']+' дэлгэрэнгүй',g['name']+' details'))}">{t('Дэлгэрэнгүй','Details')}</a></div></div></li>'''
def sec_head(i,mn,en,intro_mn,intro_en):
    return f'<h2 class="rv">{t(mn,en)}</h2>\n<p class="intro rv sel">{t(intro_mn,intro_en)}</p>'
ORG={"@type":"Organization","@id":D+"#org","name":"ELITE GAME$","alternateName":["ELITE GAMES","ELITE GAME"],"url":D,"logo":D+"assets/img/icon-512.png","foundingDate":"2025",
 "description":"Монголын Roblox хамт олон. Mongolia Troll Tower, Mongolia Hangout зэрэг тоглоомыг бүтээдэг баг.","founder":{"@id":D+"#elitebx"},
 "member":[{"@id":D+"#elitebx"}]+[{"@type":"Person","name":n,"jobTitle":j} for _,n,j,_ in TEAM[1:]],"sameAs":[ROB,DISC,TT]}
PERSON={"@type":"Person","@id":D+"#elitebx","name":"eliteBX","alternateName":["DevNamedElite","DEVNAMEDELITE"],"jobTitle":"CEO & Founder","worksFor":{"@id":D+"#org"}}
WEB={"@type":"WebSite","@id":D+"#site","url":D,"name":"ELITE GAME$","alternateName":["ELITE GAMES","Elite Game$"],"inLanguage":"mn","publisher":{"@id":D+"#org"}}
VG=[{"@type":"VideoGame","name":g['name'],"url":f"{D}{g['slug']}/","image":D+'assets/img/'+g['img'],"gamePlatform":"Roblox","publisher":{"@id":D+"#org"}} for g in GAMES]

# Story timeline: (year mn, year en, title mn, title en, text mn, text en, planned?)
TIMELINE=[
 ('2022 оны 12 сар','December 2022','Hero Tycoon','Hero Tycoon',
  'eliteBX ахынхаа компьютер дээр, өөрийн хувийн Elite_Erhembayr аккаунтаар Roblox Models ашиглан анхны тоглоом болох Hero Tycoon-ийг хийж эхэлсэн. Скрипт бичих туршлага бага байсан тул алдаа их гардаг байв.',
  "On his brother's computer, eliteBX started his first game, Hero Tycoon, on his personal account Elite_Erhembayr using Roblox Models. He had little scripting experience, so it had many bugs.",False),
 ('2023 он','2023','World War','World War',
  'FRZ_EZ46 нэртэй шинэ аккаунт нээж, мөн л Roblox Free Models ашиглан World War тоглоомыг хийсэн.',
  'He opened a new account, FRZ_EZ46, and made World War, again using Roblox Free Models.',False),
 ('2024 он','2024','Mongolian Empire History','Mongolian Empire History',
  'Mongolian Empire History нэртэй тоглоом хийхээр эхэлсэн ч бүтэлгүйтэж, дуусгаж чадаагүй.',
  'He started a game called Mongolian Empire History, but the project failed and was never finished.',False),
 ('2025 он','2025','ELITE GAME$ нээгдсэн','ELITE GAME$ launched',
  'ELITE GAME$ нэрээр багтайгаа албан ёсоор нээгдсэн. Энэ нэрээр гарсан анхны тоглоом нь Mongolia Hangout.',
  'ELITE GAME$ officially launched with a team. Its first game under this name was Mongolia Hangout.',False),
 ('Өнөөдөр','Today','Mongolia Troll Tower','Mongolia Troll Tower',
  'Mongolia Troll Tower бидний хамгийн алдартай тоглоом болж, Roblox дээрх хамт олон маань өссөөр байна.',
  'Mongolia Troll Tower has become our most popular game, and our Roblox community keeps growing.',False),
 ('2027 он','2027','Том шинэчлэлт','Major update',
  'Бүх тоглоомдоо томоохон шинэчлэлт хийхээр төлөвлөж байна.',
  'We plan a major update to all of our games.',True),
]
def tl_li(y,ye,h,he,x,xe,plan):
    tag=f'<span class="tag">{t("Төлөвлөгөө","Planned")}</span>' if plan else ''
    hh=t(h,he) if h!=he else h
    return f'<li class="rv{" plan" if plan else ""}"><b>{t(y,ye)}</b>{tag}<strong>{hh}</strong><span>{t(x,xe)}</span></li>'
TL='\n'.join(tl_li(*r) for r in TIMELINE)
# ---------------- index ----------------
team=''.join(f'''<li class="m{' lead' if i==0 else ''} rv"><span class="av" data-uid="{u}" aria-hidden="true">{ch}</span><div><h3><a href="https://www.roblox.com/users/{u}/profile" target="_blank" rel="noopener">{n}</a></h3><p>{j.replace('&','&amp;')}</p>{f'<small>{t("Өмнөх нэр: DevNamedElite","Previous name: DevNamedElite")}</small>' if i==0 else ''}</div></li>''' for i,(u,n,j,ch) in enumerate(TEAM))
faq=''.join(f'<details class="rv"><summary>{t(q,qe)}</summary><p class="sel">{t(an,ae)}</p></details>' for q,qe,an,ae in FAQ)
INDEX=f'''<section class="hero" id="top"><div class="bars" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="wrap"><div class="hero-grid">
<div>
<h1><span class="ln"><span>Elite</span></span>
<span class="ln"><span>Game$</span></span></h1>
<p class="hero-lead">{t('Монголын Roblox хамт олон. Mongolia Troll Tower, Mongolia Hangout зэрэг тоглоомыг бид өөрсдөө бүтээдэг.','A Mongolian Roblox community. We build our own games, including Mongolia Troll Tower and Mongolia Hangout.')}</p>
<div class="actions"><a class="btn pri" href="#games">{t('Тоглоом сонгох','Pick a game')}</a><a class="btn" href="{ROB}" target="_blank" rel="noopener">{t('Roblox групп','Roblox group')}</a></div>
</div>
<div class="emblem"><img src="assets/img/logo-mark.webp" width="614" height="640" alt="{a(t('ELITE GAME$ лого','ELITE GAME$ logo'))}" fetchpriority="high"></div>
</div>
<ul class="stats">
<li><b id="sp">-</b><span class="on-dot">{t('яг одоо тоглож байна','playing right now')}</span></li>
<li><b id="sm">290K+</b><span class="on-dot">{t('Roblox гишүүд','Roblox members')}</span></li>
<li><b id="sv">-</b><span>{t('нийт орсон удаа','total visits')}</span></li>
<li><b>4</b><span>{t('тоглоом','games')}</span></li>
</ul>
{live_st()}</div></section>

<section class="sec" id="games"><div class="wrap">
{sec_head(0,'Тоглоом','Games','Бүгд Roblox дээр үнэгүй. Тоглоом бүр дээр яг одоо хэдэн хүн тоглож байгааг Roblox-оос шууд авч харуулна.','All free on Roblox. Each game shows how many people are playing right now, straight from Roblox.')}
<ul class="games">
{game_li(GAMES[0],True)}
{''.join(game_li(g) for g in GAMES[1:])}
</ul></div></section>

<section class="sec" id="story"><div class="wrap">
<h2 class="rv">{t('Бидний түүх','Our story')}</h2>
<div class="story">
<div class="sel rv story-intro"><p>{t('ELITE GAME$ нэг хүний хүсэл сонирхлоос эхэлсэн. Үүсгэн байгуулагч eliteBX хэдэн жилийн турш өөрийн хувийн аккаунтууд дээр тоглоом хийж, алдаа, бүтэлгүйтлээсээ суралцсаар ирсэн.','ELITE GAME$ started as one person\'s passion. For several years, founder eliteBX made games on his own personal accounts, learning from every bug and failure along the way.')}</p>
<p>{t('2025 онд тэрээр багаа бүрдүүлж, ELITE GAME$-ийг албан ёсоор нээсэн. Одоо бид Монголын тоглогчдод зориулсан тоглоомуудыг хамтдаа бүтээж байна.','In 2025 he formed a team and officially launched ELITE GAME$. Today we build games for Mongolian players together.')}</p></div>
<ol class="tl">
{TL}
</ol></div></div></section>

<section class="sec" id="team"><div class="wrap">
{sec_head(0,'Манай баг','Our team','ELITE GAME$-ийн тоглоомуудыг бүтээж, хамт олныг удирддаг хүмүүс.','The people who build ELITE GAME$ games and run the community.')}
<ul class="team">{team}</ul></div></section>

<section class="sec" id="card"><div class="wrap">
{sec_head(0,'Гишүүний карт','Member card','Roblox нэрээ бичээд өөрийн ELITE GAME$ картаа үүсгээрэй. Татаж аваад найзуудтайгаа хуваалцаарай.','Enter your Roblox username to create your own ELITE GAME$ card. Download it and share it with your friends.')}
<form class="idf rv" id="idf" novalidate><input id="idn" type="text" maxlength="21" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="{a(t('Roblox нэр','Roblox username'))}" aria-label="{a(t('Roblox нэр','Roblox username'))}"><button class="btn pri" type="submit">{t('Карт үүсгэх','Create card')}</button></form>
<p class="idst" id="ids" role="status" aria-live="polite"></p>
<div class="idout" id="ido" hidden><canvas id="idc" width="1000" height="560" role="img" aria-label="ELITE GAME$ card"></canvas>
<div class="row"><button class="btn pri" id="idsave" type="button">{t('PNG татах','Download PNG')}</button><button class="btn" id="idshare" type="button" hidden>{t('Хуваалцах','Share')}</button></div></div>
<p class="mut sel note">{t('Зөвхөн Roblox дээрх нийтэд ил мэдээллийг ашиглана. Юу ч хадгалахгүй.','Only uses public information from Roblox. Nothing is stored.')}</p>
</div></section>

<section class="sec" id="news"><div class="wrap">
{sec_head(0,'Мэдээ','News','Тоглоомуудын шинэчлэл болон мэдээ энд гарна.','Game updates and news appear here.')}
<div id="uw" hidden><h3 class="sub">{t('Сүүлд шинэчлэгдсэн','Recently updated')}</h3><ul class="ups" id="ul"></ul></div>
<ul class="nl" id="nl"></ul>
<p class="mut sel" id="ne">{t('Одоогоор нэмэлт мэдээ алга. Шинэ мэдээг Discord дээрээс эхэлж харна уу.','No other news yet. Check our Discord for the latest.')}</p>
</div></section>

<section class="sec" id="faq"><div class="wrap">
<h2 class="rv">{t('Түгээмэл асуулт','FAQ')}</h2>
<div class="faq">{faq}</div></div></section>

<section class="sec" id="join"><div class="wrap">
{sec_head(0,'Нэгдэх','Join us','Шинэчлэл, эвент, тоглоомын найзууд нэг дор.','Updates, events and gaming friends in one place.')}
<ul class="join">
<li class="rv"><a href="{DISC}" target="_blank" rel="noopener"><b>Discord</b><span>{t('Сервер рүү орж хөгжүүлэгч, тоглогчидтой чатлаарай','Join the server and chat with developers and players')}</span></a></li>
<li class="rv"><a href="{TT}" target="_blank" rel="noopener"><b>TikTok</b><span>@devnamedelite</span></a></li>
<li class="rv"><a href="{ROB}" target="_blank" rel="noopener"><b>{t('Roblox групп','Roblox group')}</b><span>{t('Группын ID 35654822','Group ID 35654822')}</span></a></li>
</ul></div></section>'''
def w(path,s):
    os.makedirs(os.path.dirname(O+path) or '.',exist_ok=True);open(O+path,'w',encoding='utf8').write(s)
w('index.html',page('',('ELITE GAME$ | Монголын Roblox хамт олон, Mongolia Troll Tower','ELITE GAME$ | Mongolian Roblox community, Mongolia Troll Tower'),
 ('ELITE GAME$ (ELITE GAMES) нь Монголын Roblox хамт олон. Mongolia Troll Tower, Mongolia Hangout тоглоомын албан ёсны сайт: тоглогчийн тоо, баг, мэдээ. Үүсгэн байгуулагч eliteBX (DevNamedElite).','ELITE GAME$ (ELITE GAMES) is a Mongolian Roblox community. Official site of Mongolia Troll Tower and Mongolia Hangout: live player counts, team and news. Founded by eliteBX (DevNamedElite).'),
 INDEX,[WEB,ORG,PERSON]+VG))

# ---------------- game pages ----------------
for g in GAMES:
    oth=''.join(f'<li><a href="../{o["slug"]}/"><img src="../assets/img/{o["img"]}" width="768" height="432" alt="" loading="lazy" decoding="async"><b>{o["name"]}</b></a></li>' for o in GAMES if o is not g)
    tag=f'<span class="tag">{t(*g["tag"])}</span>' if g['tag'] else ''
    body=f'''<div class="wrap"><div class="gp">
<div class="shot"><img src="../assets/img/{g['img']}" width="768" height="432" alt="{a(t(g['name']+' тоглоомын зураг',g['name']+' game image'))}" fetchpriority="high" decoding="async">{pill()}</div>
<div><a class="crumb" href="../">{t('Нүүр хуудас','Home')}</a><br>{tag}<h1>{g['name']}</h1><p class="sel">{t(g['mn'],g['en'])}</p>
<div class="row"><a class="btn pri" href="{g['url']}" target="_blank" rel="noopener">{t('Roblox дээр тоглох','Play on Roblox')}</a><button class="btn" id="sh" type="button">{t('Холбоос хуваалцах','Share link')}</button></div><p class="mut" id="shn" role="status" aria-live="polite"></p></div></div>
<div class="facts rv"><div><b data-g="playing">-</b><span class="on-dot">{t('одоо тоглож байна','playing now')}</span></div><div><b data-g="visits">-</b><span>{t('нийт орсон удаа','total visits')}</span></div><div><b data-g="fav">-</b><span>{t('дуртай гэж тэмдэглэсэн','favorites')}</span></div><div><b data-g="updated">-</b><span>{t('сүүлд шинэчилсэн','last updated')}</span></div></div>
{live_st()}</div>
<section class="sec"><div class="wrap"><h2 class="rv">{t('Хэрхэн тоглох вэ','How to play')}</h2>
<div class="how sel"><div class="rv"><h3 class="sub">{t('Утсан дээр','On a phone')}</h3><ol><li>{t('Roblox апп-аа App Store эсвэл Google Play-ээс татаж, үнэгүй бүртгэлээрээ нэвтэрнэ.','Download the Roblox app from the App Store or Google Play and log in with your free account.')}</li><li>{t('"Roblox дээр тоглох" товчийг дарж, апп-аар нээхийг зөвшөөрнө.','Press "Play on Roblox" and allow it to open in the app.')}</li><li>{t('Зүүн талын дугуйгаар алхаж, баруун талын товчоор үсэрнэ.','Walk with the left joystick and jump with the button on the right.')}</li></ol></div>
<div class="rv"><h3 class="sub">{t('Компьютер дээр','On a computer')}</h3><ol><li>{t('roblox.com дээр үнэгүй бүртгэл нээж нэвтэрнэ.','Create a free account on roblox.com and log in.')}</li><li>{t('"Roblox дээр тоглох" товчийг дараад, нээгдсэн хуудсан дээрх Play товчийг дарна. Анх удаа бол Roblox Player суулгана.','Press "Play on Roblox", then the Play button on the page that opens. If it is your first time, Roblox Player will install.')}</li><li>{t('W, A, S, D товчоор алхаж, Space товчоор үсэрнэ. Камераа хулганаар эргүүлнэ.','Walk with W, A, S, D and jump with Space. Move the camera with the mouse.')}</li></ol></div></div></div></section>
<section class="sec"><div class="wrap"><h2 class="rv">{t('Бусад тоглоом','More games')}</h2><ul class="rel">{oth}</ul></div></section>'''
    ld=[WEB,ORG,{"@type":"VideoGame","name":g['name'],"url":f"{D}{g['slug']}/","description":g['mn'],"gamePlatform":"Roblox","inLanguage":"mn","image":D+'assets/img/'+g['img'],"publisher":{"@id":D+"#org"},"sameAs":[g['url']]},
        {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"ELITE GAME$","item":D},{"@type":"ListItem","position":2,"name":g['name'],"item":f"{D}{g['slug']}/"}]}]
    w(g['slug']+'/index.html',page(g['slug']+'/',(f"{g['name']} | Roblox тоглоом | ELITE GAME$",f"{g['name']} | Roblox game | ELITE GAME$"),
     (f"{g['name']} - ELITE GAME$-ийн Roblox тоглоом. "+g['mn'][:90].rstrip(),f"{g['name']} - a Roblox game by ELITE GAME$. "+g['en'][:90].rstrip()),body,ld,'../',f' data-page="{g["pid"]}"'))

# ---------------- old long addresses -> short addresses ----------------
# Links shared before the switch (e.g. eegs.blog/mongolia-troll-tower/) keep working and send people to eegs.blog/mtt/.
for g in GAMES:
    if not g.get('old'):continue
    n=a(g['name']);to=f"../{g['slug']}/"
    w(g['old']+'/index.html',f'''<!DOCTYPE html>
<html lang="mn"><head><meta charset="utf-8"><title>{n} | ELITE GAME$</title>
<meta name="robots" content="noindex,follow"><link rel="canonical" href="{D}{g['slug']}/">
<meta http-equiv="refresh" content="0; url={to}">
<script>location.replace({json.dumps(to)}+location.search+location.hash)</script></head>
<body><p><a href="{to}">{n}</a></p></body></html>
''')

# ---------------- terms / privacy ----------------
for p,ti,tie,de,dee in [('terms','Үйлчилгээний нөхцөл | ELITE GAME$','Terms of Service | ELITE GAME$','ELITE GAME$ (eegs.blog) сайтыг ашиглах үйлчилгээний нөхцөл.','Terms of service for using the ELITE GAME$ (eegs.blog) website.'),
                        ('privacy','Нууцлалын бодлого | ELITE GAME$','Privacy Policy | ELITE GAME$','ELITE GAME$ (eegs.blog) сайтын нууцлалын бодлого: ямар мэдээлэл хэрхэн ашиглагддаг тухай.','Privacy policy of the ELITE GAME$ (eegs.blog) website: what information is used and how.')]:
    w(p+'/index.html',page(p+'/',(ti,tie),(de,dee),f'<div class="wrap"><article class="legal sel"><p data-enonly class="mut">The legal text is available in Mongolian only.</p>{LEG[p]}</article></div>',[WEB],'../'))

# ---------------- 404 ----------------
P404='''<!DOCTYPE html><html lang="mn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>404 | Энд юу ч байхгүй | ELITE GAME$</title><meta name="robots" content="noindex"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#050b16"><link rel="icon" href="https://eegs.blog/assets/img/favicon-32.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://eegs.blog/assets/app.css?v=__V__">
<style>body{display:grid;min-height:100vh;place-items:center;padding:24px 0}.nf{max-width:640px}.nf h1{font-size:clamp(4rem,22vw,8rem);margin:0 0 8px}.nf p{color:var(--mut);margin:0 0 6px}.nf canvas{width:100%;height:auto;display:block;margin-top:26px;background:rgba(8,20,40,.85);clip-path:var(--cp)}</style></head>
<body><div class="bgfx" aria-hidden="true"><i></i><i></i></div><div class="wrap nf"><h1><span class="ln"><span>404</span></span></h1>
<p data-en="Nothing here. The page or address you were looking for was not found.">Энд юу ч байхгүй. Таны хайсан хуудас эсвэл хаяг олдсонгүй.</p>
<div class="actions"><a class="btn pri" href="https://eegs.blog/" data-en="Back to home">Нүүр хуудас руу буцах</a></div>
<canvas id="cv" width="320" height="150" aria-hidden="true"></canvas>
<p style="margin-top:12px" data-en="Press Space or the up arrow, or tap the screen to jump.">Үсрэхийн тулд Space эсвэл дээш сум дарна, утсан дээр дэлгэцээ товшино.</p></div>
<script>
(()=>{const q=s=>document.querySelector(s),cv=q('#cv'),c=cv.getContext('2d'),W=320,GY=128,PX=36;
try{if(localStorage.getItem('eg-lang')==='en'){document.documentElement.lang='en';document.title='404 | Nothing here | ELITE GAME$';document.querySelectorAll('[data-en]').forEach(e=>e.textContent=e.dataset.en)}}catch(e){}
document.addEventListener('contextmenu',e=>e.preventDefault());
const im=new Image();im.src='https://eegs.blog/assets/img/logo-mark.webp';im.onload=()=>draw();
let best=0;try{best=+localStorage.getItem('eg-404')||0}catch(e){}
let s={run:0,over:0,y:0,v:0,o:[],t:0,gap:130,last:0};
function jump(){if(!s.run){s={run:1,over:0,y:0,v:0,o:[],t:0,gap:130,last:performance.now()};requestAnimationFrame(f);return}if(s.y===0)s.v=9}
function f(now){if(!s.run){draw();return}const k=Math.min(2,(now-s.last)/16.67);s.last=now;s.t+=k;s.y+=s.v*k;s.v-=.55*k;if(s.y<=0){s.y=0;s.v=0}
const sp=(2.8+Math.min(2.4,s.t/1500))*k,l=s.o[s.o.length-1];
if(!l||W-l.x>s.gap){s.o.push({x:W,w:12,h:16+Math.floor(Math.random()*10)});s.gap=120+Math.floor(Math.random()*90)}
s.o.forEach(o=>o.x-=sp);s.o=s.o.filter(o=>o.x+o.w>0);
for(const o of s.o)if(PX+20>o.x&&PX+4<o.x+o.w&&s.y<o.h-2){s.run=0;s.over=1;const sc=Math.floor(s.t/6);if(sc>best){best=sc;try{localStorage.setItem('eg-404',best)}catch(e){}}}
draw();if(s.run)requestAnimationFrame(f)}
function draw(){c.clearRect(0,0,W,150);c.fillStyle='#2f7fd0';c.fillRect(0,GY,W,2);
s.o.forEach(o=>{c.fillStyle='#4fc3f7';c.beginPath();c.moveTo(o.x+4,GY);c.lineTo(o.x+o.w+4,GY);c.lineTo(o.x+o.w,GY-o.h);c.lineTo(o.x,GY-o.h);c.closePath();c.fill()});
if(im.complete&&im.naturalWidth)c.drawImage(im,PX,GY-26-s.y,25,26);else{c.fillStyle='#4fc3f7';c.fillRect(PX,GY-24-s.y,22,24)}
c.fillStyle='#9db4cc';c.font='700 11px "Exo 2",sans-serif';c.textAlign='right';c.fillText('SCORE '+Math.floor(s.t/6)+'   BEST '+best,W-8,16);
c.textAlign='center';c.fillStyle='#eaf6ff';c.font='800 14px "Exo 2",sans-serif';if(s.over)c.fillText('GAME OVER - SPACE / TAP',W/2,56);else if(!s.run)c.fillText('SPACE / TAP',W/2,56)}
document.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}});
cv.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){s.run=0;s.over=0;draw()}});draw()})();
</script></body></html>'''.replace('__V__',V)
w('404.html',P404)
# ---------------- sitemap ----------------
import datetime
TODAY=datetime.date.today().isoformat()
SM=[('',  'weekly','1.0')]+[(g['slug']+'/','weekly','0.8') for g in GAMES]+[('terms/','monthly','0.3'),('privacy/','monthly','0.3')]
w('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(
  f'  <url>\n    <loc>{D}{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>{c}</changefreq>\n    <priority>{pr}</priority>\n  </url>\n' for u,c,pr in SM)+'</urlset>\n')
w('assets/en.js','window.EN='+json.dumps(EN,ensure_ascii=False)+';\n')
os.path.exists(O+'news.json') or w('news.json',json.dumps({"_readme":"Мэдээ нэмэхдээ news жагсаалтад {\"date\":\"2026-11-01\",\"tag\":\"Шинэ\",\"tag_en\":\"New\",\"game\":\"Mongolia Troll Tower\",\"title\":\"...\",\"title_en\":\"...\",\"text\":\"...\",\"text_en\":\"...\",\"link\":\"https://...\",\"linkText\":\"Дэлгэрэнгүй\",\"linkText_en\":\"Details\"} хэлбэрээр нэм.","news":[]},ensure_ascii=False,indent=2)+'\n')
print('built',len(EN),'strings')
