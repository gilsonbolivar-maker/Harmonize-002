import { CLINIC } from '../data/clinic';

/**
 * Retrato da Jimena. A imagem entra inteira: object-fit contain, sem corte e sem zoom.
 */
export function ProfessionalPortrait({ className = '' }: { className?: string }) {
  const base = import.meta.env.BASE_URL;
  return (
    <picture className={`block w-full ${className}`}>
      <source srcSet={`${base}${CLINIC.photoWebp}`} type="image/webp" />
      <img
        src={`${base}${CLINIC.photoJpg}`}
        alt={`Foto de ${CLINIC.name}`}
        width={960}
        height={1200}
        draggable={false}
        className="foto-jimena"
      />
    </picture>
  );
}
