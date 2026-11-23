import AccessForm from './access-form';
import { safeReturnTo } from '../../lib/server/config.mjs';
import './access.css';
export const metadata = { title: 'Mi cuenta · RPM' };
export default async function AccessPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const params = await searchParams;
  return <main className="rpm-access"><a className="rpm-access-logo" href="/" aria-label="RPM, volver a la tienda">RPM<span>REBAJAS POR MINUTO</span></a><section className="rpm-access-card"><span className="rpm-access-kicker">TU CUENTA RPM</span><h1>Tu próxima compra,<br />más organizada.</h1><p>Accede a tus cotizaciones desde cualquier dispositivo.</p><AccessForm returnTo={safeReturnTo(params.return_to)} /></section><a className="rpm-access-back" href="/">Volver a la tienda</a></main>;
}
