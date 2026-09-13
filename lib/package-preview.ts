type ProductIdentity = {
  brand: string;
  name: string;
};

export type PackagePreview = {
  image: string;
  alt: string;
  caption: string;
};

export function getPackagePreview(product: ProductIdentity): PackagePreview | null {
  const identity = `${product.brand} ${product.name}`.toLowerCase();

  if (identity.includes("easysmx") && identity.includes("d10")) {
    return {
      image: "/easysmx-d10-included.webp",
      alt: "Contenido completo del EasySMX D10 negro",
      caption: "Control + base + receptor + cable + manual",
    };
  }

  if (identity.includes("gamesir") && identity.includes("nova 2")) {
    return {
      image: "/gamesir-nova2-accessories.jpg",
      alt: "Base de carga y receptor compatibles con GameSir Nova 2 Lite",
      caption: "Incluye base de carga y receptor USB",
    };
  }

  if (
    identity.includes("attack shark") &&
    (identity.includes("x3 pro") || identity.includes("x3 wireless"))
  ) {
    return {
      image: "/attack-shark-x3-included.webp",
      alt: "Contenido completo del Attack Shark X3 Pro blanco",
      caption: "Mouse + receptor + cable + manual y grips",
    };
  }

  return null;
}
