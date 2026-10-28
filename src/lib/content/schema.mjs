import { z } from 'zod';
import { categories } from '../events/categories.ts';

export const categoryNames = Object.keys(categories);
const requiredText = z.string({ error: 'é obrigatório e deve ser um texto' }).trim().min(1, 'não pode ficar vazio');
export const slugSchema = z.string({ error: 'deve ser um identificador de texto' }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'deve conter letras minúsculas sem acento, números e hífens');
export const dateSchema = z.string({ error: 'deve ter o formato AAAA-MM-DD' }).refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'deve ter o formato AAAA-MM-DD e ser uma data válida');
export const venueSchema = z.object({
  slug: slugSchema, nome: requiredText, endereço: requiredText,
  lat: z.number({ error: 'deve ser um número' }).min(-90).max(90),
  lng: z.number({ error: 'deve ser um número' }).min(-180).max(180)
}).strict();
export const eventSchema = z.object({
  title: requiredText,
  category: z.enum(categoryNames, { error: `deve ser uma destas categorias: ${categoryNames.join(', ')}` }),
  date: dateSchema,
  time: z.string({ error: 'deve ter o formato HH:MM' }).regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'deve ter o formato HH:MM'),
  endDate: dateSchema.optional(),
  venue: slugSchema.or(z.literal('')).nullable().optional(),
  link: z.url({ error: 'deve ser uma URL completa com http ou https' }).refine((value) => /^https?:\/\//.test(value), 'deve usar http ou https').optional(),
  example: z.boolean({ error: 'deve ser true ou false' }).optional(),
  description: requiredText
}).strict().refine((event) => !event.endDate || event.endDate >= event.date, {
  path: ['endDate'], error: 'não pode ser anterior à data inicial'
});

export function formatIssues(file, issues) {
  return issues.map((issue) => {
    const field = issue.path.join('.') || 'conteúdo';
    const message = issue.code === 'unrecognized_keys' ? `contém campos desconhecidos: ${issue.keys.join(', ')}`
      : issue.code === 'too_small' ? 'está abaixo do mínimo permitido'
      : issue.code === 'too_big' ? 'está acima do máximo permitido' : issue.message;
    return `${file}: campo '${field}' ${message}`;
  });
}
