import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import GlassCard from '../components/ui/GlassCard';

export default function Privacy() {
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
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Icon name="security" className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-montserrat text-2xl md:text-3xl font-bold text-on-surface">Política de privacidad ⛸️</h1>
            <p className="text-on-surface-variant font-inter text-sm mt-1">Última actualización: Enero 2024</p>
          </div>
        </div>

        <div className="space-y-6 text-on-surface font-inter">
          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">1. Información que recopilamos</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              StarPay Patinaje Élite recopila información personal que usted nos proporciona directamente cuando utiliza nuestra plataforma, 
              incluyendo pero no limitado a: nombre, dirección de correo electrónico, información de contacto y datos relacionados 
              con el rendimiento deportivo de los atletas gestionados a través del sistema.
            </p>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">2. Uso de la información</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Gestionar y administrar el personal y los atletas de la institución</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Registrar y seguir el rendimiento en competencias</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Administrar pagos y facturación</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Mejorar la experiencia del usuario en nuestra plataforma</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">3. Seguridad de los datos</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger su información personal 
              contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Sus datos se almacenan 
              en servidores seguros con cifrado apropiado.
            </p>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">4. Compartir información</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              No vendemos, intercambiamos ni transferimos su información personal a terceros, excepto cuando sea necesario 
              para el funcionamiento del servicio o cuando lo requiera la ley.
            </p>
          </section>

          <section>
            <h2 className="font-montserrat text-lg font-semibold text-on-surface mb-3">5. Sus derechos</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Usted tiene derecho a acceder, corregir o eliminar su información personal. Para ejercer estos derechos, 
              por favor contacte al administrador del sistema.
            </p>
          </section>

          <div className="pt-6 mt-6 border-t border-border-subtle">
            <p className="text-xs text-on-surface-variant font-inter">
              © 2024 StarPay Patinaje Élite. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
