"use client";

import Home from "@/app/page";

type StoreSection = "inicio" | "productos" | "comparar" | "envios" | "preguntas" | "contacto";

export function StoreSectionView({ section }: { section: StoreSection }) {
  return (
    <div className={`storeSectionView view-${section}`}>
      <Home />
      <style jsx global>{`
        .storeSectionView > main { min-height: 0 !important; padding-bottom: 0 !important; background: transparent !important; }
        .storeSectionView .siteTop, .storeSectionView .background, .storeSectionView .hero,
        .storeSectionView .reelExperience, .storeSectionView .products, .storeSectionView .recentSection,
        .storeSectionView .savedCart, .storeSectionView .compareSection, .storeSectionView .benefits,
        .storeSectionView .payment, .storeSectionView .faqSection, .storeSectionView .shareSection,
        .storeSectionView .contact, .storeSectionView > main > footer, .storeSectionView .mobileDock,
        .storeSectionView .supportFloat, .storeSectionView .backToTop { display: none !important; }
        .storeSectionView.view-inicio .hero { display: flex !important; }
        .storeSectionView.view-inicio .reelExperience,
        .storeSectionView.view-productos .recentSection,
        .storeSectionView.view-comparar .compareSection,
        .storeSectionView.view-envios .payment,
        .storeSectionView.view-contacto .contact { display: block !important; }
        .storeSectionView.view-productos .savedCart { display: flex !important; }
        .storeSectionView.view-envios .benefits,
        .storeSectionView.view-preguntas .faqSection { display: grid !important; }
        .storeSectionView.view-productos .products { display: block !important; padding-top: 70px; }
        .storeSectionView.view-inicio .hero { min-height: calc(100dvh - 116px); padding-top: 95px; }
        .storeSectionView.view-inicio .reelExperience { padding-top: 45px; }
        .storeSectionView.view-comparar .compareSection, .storeSectionView.view-preguntas .faqSection { margin-top: 70px; }
        .storeSectionView.view-envios .benefits { margin-top: 70px; }
        .storeSectionView.view-contacto .contact { min-height: calc(100dvh - 190px); align-content: center; }
      `}</style>
    </div>
  );
}
