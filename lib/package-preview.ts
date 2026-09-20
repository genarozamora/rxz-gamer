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

  if (identity.includes("attack shark") && identity.includes("x3 pro")) {
    return {
      image: "/attack-shark-x3-white-receiver.webp",
      alt: "Attack Shark X3 Pro 8K con receptor inalámbrico",
      caption: "Mouse, receptor 8K, cable USB-C y manual",
    };
  }

  if (identity.includes("gamesir") && identity.includes("nova 2 lite")) {
    return {
      image: "/gamesir-nova2-accessories.jpg",
      alt: "Accesorios compatibles del combo GameSir Nova 2 Lite",
      caption: "Control, base RGB, receptor 2.4 GHz, cable USB-C y manual",
    };
  }

  if (identity.includes("aula") && identity.includes("f75 he")) {
    return {
      image: "/aula-f75-he-black-contour-official.jpg",
      alt: "AULA F75 HE Black Contour",
      caption: "Teclado, receptor 2.4 GHz, cable USB-C, extractor y manual",
    };
  }

  if (identity.includes("easysmx") && identity.includes("d10")) {
    return {
      image: "/easysmx-d10-included.webp",
      alt: "Contenido completo de la caja EasySMX D10",
      caption: "Control, base, receptor 2.4 GHz, cable USB-C y manual",
    };
  }

  return null;
}
