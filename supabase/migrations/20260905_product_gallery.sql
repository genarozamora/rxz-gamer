-- Galerías ampliadas con vistas de colores, accesorios y contenido del paquete.

update public.products set images = '[
  "https://e-topshop.com.ua/image/cache/catalog/mouse/ASX3/Pro/black-800x800.jpeg",
  "https://attackshark.com/cdn/shop/files/1_4K_logo_d23c047c-0870-4d14-981a-82735559aa68.jpg?v=1712546749&width=2048",
  "https://taskrevolution.com/cdn/shop/files/MouseX3PRO_3.webp?v=1719776150&width=1946",
  "https://techdiversitybd.com/wp-content/uploads/2024/04/Attack-Shark-x3-pro.png",
  "https://http2.mlstatic.com/D_Q_NP_2X_972874-MLB77246414533_062024-E-mouse-game-attack-shark-x3-pro-4k-sfio-8k-cfio-paw3395-59g.webp"
]'::jsonb, updated_at = now() where id = 1;

update public.products set images = '[
  "/gamesir-nova2-lite.png", "/gamesir-nova2-lite-2.jpg", "/gamesir-nova2-lite-3.jpg",
  "https://down-ph.img.susercontent.com/file/my-11134208-820lb-mio261i1lgjmce",
  "https://down-ph.img.susercontent.com/file/my-11134208-820l8-mio261i1ineq8a"
]'::jsonb, updated_at = now() where id = 3;

update public.products set images = '[
  "/aula-f75-he-alibaba-1.jpg", "/aula-f75-he-alibaba-2.jpg", "/aula-f75-he-alibaba-3.jpg",
  "https://lacdau.com/media/product/6546-z6511049706330_d7050573782eed397359cc42f36080ed.jpg",
  "https://lacdau.com/media/product/250-6546-z6511049698713_415ee834ab8cf5d7da8ff7332767e332.jpg"
]'::jsonb, updated_at = now() where id = 6;

update public.products set images = '[
  "https://www.easysmx.com/cdn/shop/files/D10_-1000X1000_b7bff737-127f-492d-8436-120915dce879_1024x1024.png?v=1747905818",
  "https://cdn.qeemat.com.pk/product/11116/easysmx-d10-wireless-gaming-controller-black.png",
  "https://m.media-amazon.com/images/I/71iCwG4m6RL._AC_SL1500_.jpg"
]'::jsonb, updated_at = now() where id = 7;
