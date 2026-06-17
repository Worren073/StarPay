import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import GlassCard from '../components/ui/GlassCard';

export default function Support() {
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

      <div className="text-center mb-8">
        <h1 className="font-montserrat text-2xl md:text-3xl font-bold text-on-surface mb-2">Soporte y ayuda ⛸️</h1>
        <p className="text-on-surface-variant font-inter text-base">Estamos aquí para ayudarte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Contact */}
        <GlassCard className="p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/30 transition-colors">
              <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-1.47 3.665c-.299.182-1.754.935-1.996 1.034-.24.099-.485.15-.73.15-.246 0-.604-.062-.961-.185-.528-.185-1.919-.78-3.335-2.443-1.239-1.448-2.078-3.18-2.14-3.338-.061-.159-.51-.61-.51-.89 0-.28.129-.42.173-.47.051-.05.102-.124.153-.186a.7.7 0 0 1 .476-.201c.154 0 .307.023.441.069.213.069 3.193 1.337 3.469 1.46.276.122.459.18.52.231.061.051.982 1.223 2.039 2.64.884 1.194 1.577 2.12 1.761 2.496.184.376.154.601.102.723-.05.121-.198.25-.347.432z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.06 2.308 7.038L0 24l5.121-2.109C7.086 23.307 9.472 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.35 0-4.539-.689-6.432-1.88l-.464-.291-3.009 1.237 1.277-2.932-.319-.48C1.82 16.024 2 14.065 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
            </div>
            <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-2">WhatsApp</h3>
            <p className="text-sm text-on-surface-variant font-inter mb-4">
              Contacto directo para soporte inmediato
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-600 font-inter text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-1.47 3.665c-.299.182-1.754.935-1.996 1.034-.24.099-.485.15-.73.15-.246 0-.604-.062-.961-.185-.528-.185-1.919-.78-3.335-2.443-1.239-1.448-2.078-3.18-2.14-3.338-.061-.159-.51-.61-.51-.89 0-.28.129-.42.173-.47.051-.05.102-.124.153-.186a.7.7 0 0 1 .476-.201c.154 0 .307.023.441.069.213.069 3.193 1.337 3.469 1.46.276.122.459.18.52.231.061.051.982 1.223 2.039 2.64.884 1.194 1.577 2.12 1.761 2.496.184.376.154.601.102.723-.05.121-.198.25-.347.432z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.06 2.308 7.038L0 24l5.121-2.109C7.086 23.307 9.472 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.35 0-4.539-.689-6.432-1.88l-.464-.291-3.009 1.237 1.277-2.932-.319-.48C1.82 16.024 2 14.065 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              </svg>
              Abrir chat
            </a>
          </div>
        </GlassCard>

        {/* Email Support */}
        <GlassCard className="p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
              <Icon name="email" className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-2">Email</h3>
            <p className="text-sm text-on-surface-variant font-inter mb-4">
              Soporte detallado por correo electrónico
            </p>
            <p className="text-primary font-inter text-sm font-semibold">
              soporte@starpay.com
            </p>
          </div>
        </GlassCard>

        {/* Documentation */}
        <GlassCard className="p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 transition-colors">
              <Icon name="description" className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-2">Documentación</h3>
            <p className="text-sm text-on-surface-variant font-inter mb-4">
              Guías y tutoriales paso a paso
            </p>
            <a
              href="#"
              className="text-secondary font-inter text-sm font-semibold flex items-center justify-center gap-1 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Ver documentación <Icon name="arrow_forward" className="w-4 h-4" />
            </a>
          </div>
        </GlassCard>

        {/* System Status */}
        <GlassCard className="p-6 hover:border-primary/50 transition-all duration-300">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-2">Estado del sistema</h3>
            <p className="text-sm text-on-surface-variant font-inter mb-4">
              Todos los servicios funcionando correctamente
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-600 text-sm font-semibold font-inter">Óptimo</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* FAQ Section */}
      <div className="mt-8">
        <h2 className="font-montserrat text-xl font-semibold text-on-surface mb-6">Preguntas frecuentes</h2>
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-montserrat text-base font-semibold text-on-surface mb-2 flex items-center gap-2">
              <Icon name="help" className="w-5 h-5 text-primary" />
              ¿Cómo agrego un nuevo atleta?
            </h3>
            <p className="text-sm text-on-surface-variant font-inter leading-relaxed">
              Navegue a la sección "Atletas" en el menú lateral, haga clic en el botón "Nuevo atleta" y complete 
              el formulario con los datos del atleta. Asegúrese de completar todos los campos obligatorios.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-montserrat text-base font-semibold text-on-surface mb-2 flex items-center gap-2">
              <Icon name="help" className="w-5 h-5 text-primary" />
              ¿Cómo registro resultados de una competencia?
            </h3>
            <p className="text-sm text-on-surface-variant font-inter leading-relaxed">
              En la sección "Competencias", seleccione la competencia deseada haciendo clic en "Gestionar". 
              Desde el detalle de la competencia podrá ver y gestionar los resultados registrados.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-montserrat text-base font-semibold text-on-surface mb-2 flex items-center gap-2">
              <Icon name="help" className="w-5 h-5 text-primary" />
              ¿Cómo cambio entre modo oscuro y claro?
            </h3>
            <p className="text-sm text-on-surface-variant font-inter leading-relaxed">
              Haga clic en el ícono de configuración (⚙️) en la barra superior. En el menú desplegable 
              encontrará un toggle para cambiar entre modo oscuro y modo claro. Su preferencia se guardará 
              automáticamente.
            </p>
          </GlassCard>
        </div>
      </div>

      <div className="pt-6 mt-8 border-t border-border-subtle text-center">
        <p className="text-xs text-on-surface-variant font-inter">
          © 2024 StarPay Patinaje Élite. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
