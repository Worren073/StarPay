import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import GlassCard from '../components/ui/GlassCard';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 font-inter text-sm"
      >
        <Icon name="arrow_back" className="w-4 h-4" />
        Volver
      </button>

      <GlassCard className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <Icon name="description" className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="font-montserrat text-2xl md:text-3xl font-bold text-on-surface">Términos de servicio</h1>
            <p className="text-on-surface-variant font-inter text-sm mt-1">Última actualización: Enero 2024</p>
          </div>
        </div>

        <div className="space-y-6 text-on-surface font-inter">
          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">1. Aceptación de los términos</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Al acceder y utilizar la plataforma StarPay Patinaje Élite, usted acepta cumplir y estar sujeto a estos 
              términos de servicio. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">2. Descripción del servicio</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              StarPay es una plataforma de gestión diseñada para clubes de patinaje que permite:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Gestión de atletas y seguimiento de rendimiento</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Administración de competencias y resultados</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Control de pagos y facturación</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Gestión de personal y entrenadores</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">3. Cuentas de usuario</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Para utilizar ciertas funcionalidades de la plataforma, necesitará crear una cuenta de usuario. 
              Usted es responsable de:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Proporcionar información precisa y actualizada</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Mantener la confidencialidad de su contraseña</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Notificar inmediatamente cualquier uso no autorizado</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">4. Uso aceptable</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Usted se compromete a utilizar la plataforma únicamente para fines legales y de acuerdo con estos términos. 
              Está prohibido:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="cancel" className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <span>Intentar acceder a áreas restringidas sin autorización</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="cancel" className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <span>Interferir con el funcionamiento normal de la plataforma</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="cancel" className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <span>Utilizar la plataforma para actividades ilegales o dañinas</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="cancel" className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <span>Compartir credenciales de acceso sin autorización</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">5. Modificaciones</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor 
              inmediatamente después de su publicación en la plataforma. Se recomienda revisar estos términos periódicamente.
            </p>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">6. Contacto</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Si tiene preguntas sobre estos términos de servicio, por favor contacte al administrador del sistema 
              a través de los canales disponibles en la sección de soporte.
            </p>
          </section>

          <div className="pt-6 mt-6 border-t border-white/10">
            <p className="text-xs text-on-surface-variant font-inter">
              © 2024 StarPay Patinaje Élite. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
