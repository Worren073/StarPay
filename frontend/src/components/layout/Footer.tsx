import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="flex flex-col items-center text-center gap-2 px-container-padding-mobile md:px-container-padding-desktop md:ml-[112px] py-4 mt-auto bg-transparent z-30 relative mb-20 md:mb-0">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="font-montserrat text-sm font-semibold text-primary">StarPay</span>
        <span className="text-on-surface-variant text-xs">© 2024 StarPay Patinaje Élite. Estado del sistema: Óptimo</span>
      </div>
      <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
        <Link to="/privacy" className="text-xs text-on-surface-variant hover:text-primary opacity-80 hover:opacity-100 transition-colors whitespace-nowrap">
          Política de privacidad
        </Link>
        <Link to="/terms" className="text-xs text-on-surface-variant hover:text-primary opacity-80 hover:opacity-100 transition-colors whitespace-nowrap">
          Términos de servicio
        </Link>
        <Link to="/support" className="text-xs text-on-surface-variant hover:text-primary opacity-80 hover:opacity-100 transition-colors whitespace-nowrap">
          Soporte
        </Link>
      </div>
    </footer>
  );
}
