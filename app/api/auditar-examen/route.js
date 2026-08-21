// app/api/auditar-examen/route.js
import { GoogleGenAI, Type } from '@google/genai';
import { LIMITE_GRATIS, PERFILES_GRATIS } from '@/lib/constants';
import { getUsage, incrementUsage } from '@/lib/usage';

export const dynamic = 'force-dynamic';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json(
        { error: 'El cuerpo de la petición debe ser un objeto JSON válido.' },
        { status: 400 }
      );
    }

    const {
      archivo_base64 = '',
      mime_type = 'image/jpeg',
      texto_examen = '',
      curso = '3º Educación Primaria',
      materia = 'Lengua Castellana',
      perfil = 'TDAH con déficit de atención sostenida',
      uid = '',
      es_pro = false,
    } = body;

    if (!uid) {
      return Response.json(
        { error: 'Debes iniciar sesión para auditar exámenes.' },
        { status: 401 }
      );
    }

    if (!archivo_base64 && !texto_examen.trim()) {
      return Response.json(
        { error: 'Debes subir una foto/PDF o escribir las preguntas del examen.' },
        { status: 400 }
      );
    }

    // Rate limiting (skip for pro users)
    if (!es_pro) {
      // Profile restriction: free users can only use 3 TDAH profiles
      if (!PERFILES_GRATIS.includes(perfil)) {
        return Response.json(
          { error: 'En el plan gratuito solo estan disponibles los 3 perfiles de TDAH. Actualiza a Pro para acceder a los 16 perfiles NEAE.' },
          { status: 403 }
        );
      }
      const usage = getUsage();
      const count = usage[uid] || 0;
      if (count >= LIMITE_GRATIS) {
        return Response.json(
          {
            error: `Has alcanzado el límite de ${LIMITE_GRATIS} auditorías gratis. Actualiza a Pro para auditorías ilimitadas.`,
            limite_alcanzado: true,
          },
          { status: 429 }
        );
      }
      incrementUsage(uid);
    }

    let contentsParts = [];

    const promptAuditoria = `
ERES UN ORIENTADOR PSICOPEDAGÓGICO E INSPECTOR EDUCATIVO ESPECIALISTA EN MARCO DUA / NEAE Y LOMLOE.

Tu misión es AUDITAR exhaustivamente el examen aportado para el curso "${curso}" en la asignatura "${materia}", evaluando si cumple con las adaptaciones curriculares no significativas exigidas para el perfil: "${perfil}".

CONOCIMIENTO ESPECÍFICO DEL PERFIL:
- Si es TDAH (cualquier presentación): evalúa distractores visuales, longitud de enunciados, sobrecarga cognitiva, necesidad de descansos, claridad de instrucciones paso a paso.
- Si es Dislexia: evalúa tipografía, interlineado, longitud de palabras, complejidad léxica, necesidad de bancos de palabras, tiempo de lectura.
- Si es TDL/TEL: evalúa complejidad sintáctica de consignas, vocabulario técnico, comprensión de instrucciones orales vs escritas, necesidad de apoyos visuales.
- Si es Discalculia: evalúa complejidad numérica, operaciones encadenadas, necesidad de manipulativos, claridad de enunciados matemáticos.
- Si es DCD: evalúa espacio de escritura, margen para desarrollo, complejidad motriz de la tarea.
- Si es Altas Capacidades: evalúa si el examen supone reto real, si hay enriquecimiento, si se permite profundización.
- Si es Ansiedad: evalúa presión temporal implícita, complejidad percibida, lenguaje calmador en consignas, flexibilidad de formatos.
- Si es TEA: evalúa literalidad de consignas, ambigüedad, cambios de formato, necesidad de rutinas predecibles.
- Si es Barreras Sensoriales: evalúa contraste, tamaño de texto, accesibilidad de formatos no textuales.
- Si es Multidiscapacidad: evalúa multiples barreras simultáneas y prioriza las adaptaciones más críticas.

PARTE 1 - ANALISIS:
1. Accesibilidad visual y distractores.
2. Formato y redacción de consignas (pasos simples, sobrecarga de enunciados).
3. Apoyos metodológicos necesarios (andamiaje, pautas, justificaciones adaptativas).
4. Veredicto formal con puntuación técnica (0-100) y recomendaciones directas de aula.

PARTE 2 - EXAMEN YA ADAPTADO (esto es lo mas importante, es el entregable real para el profesor):
Reescribe el examen COMPLETO, pregunta por pregunta, aplicando tú mismo las adaptaciones que recomiendas, no solo describiéndolas. Para cada pregunta del examen original:
- Simplifica el enunciado si es necesario (frases cortas, un solo paso por instrucción).
- Si el ejercicio es muy largo o denso, indica cómo trocearlo visualmente (párrafos más cortos, numeración clara).
- Añade una justificación clara y concisa de POR QUÉ esta adaptación concreta es necesaria para el perfil del alumno seleccionado, explicando la barrera cognitiva/lectora/motriz que resuelve.
- Clasifica la adaptación aplicada en una categoría concreta: "Simplificación léxica", "Reducción de carga cognitiva", "Espacio ampliado", "Tiempo adicional", "Apoyo visual", "Andamiaje de instrucciones", "Reducción de distracción", "Flexibilización de formato", "Apoyo motriz" o "Enriquecimiento".
- Vincula la adaptación al principio DUA que resuelve: "Representación" (cómo se presenta la información), "Acción y expresión" (cómo responde el alumno) o "Implicación" (motivación y enganche).
- Da un consejo práctico de una línea para el profesor al aplicar esta adaptación en el aula.
- Asigna un nivel de complejidad del 1 al 10 para la pregunta original y para la versión adaptada (donde 1 es muy fácil y 10 es muy difícil).
Manten siempre el mismo contenido curricular y nivel de exigencia academica - adaptas la FORMA de presentar la pregunta, nunca reduces lo que se le pide saber al alumno.

DEBES GENERAR:
- "puntuacion_accesibilidad": Valor entero de 0 a 100.
- "estado_cumplimiento": "APROBADO" (>=80), "REQUIERE_AJUSTES" (50-79) o "NO_CUMPLE" (<50).
- "dictamen_general": Resumen técnico formal de 2-3 párrafos explicando la idoneidad psicopedagógica del examen.
- "auditoria_por_criterio": Array con 4 criterios técnicos:
    1. "Accesibilidad Visual y Distribución Espacial"
    2. "Claridad y Desglose de Consignas"
    3. "Carga Cognitiva y Tiempo de Procesamiento"
    4. "Andamiaje y Recursos de Apoyo"
    Cada uno con: criterio, cumple (boolean), observacion y recomendacion_concreta.
- "examen_adaptado": Array con el examen COMPLETO reescrito, un objeto por pregunta:
    { "numero": string, "enunciado_original": string, "enunciado_adaptado": string, "justificacion_adaptacion": string, "tipo_adaptacion": string, "criterio_dua": string, "consejo_aula": string, "complejidad_original": number (1-10), "complejidad_adaptada": number (1-10) }
`;

    contentsParts.push({ text: promptAuditoria });

    if (texto_examen.trim()) {
      contentsParts.push({ text: `CONTENIDO DEL EXAMEN:\n${texto_examen.trim()}` });
    }

    if (archivo_base64) {
      contentsParts.push({
        inlineData: {
          mimeType: mime_type || 'image/jpeg',
          data: archivo_base64,
        },
      });
    }

    const respuesta = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ role: 'user', parts: contentsParts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            puntuacion_accesibilidad: { type: Type.NUMBER },
            estado_cumplimiento: {
              type: Type.STRING,
              enum: ['APROBADO', 'REQUIERE_AJUSTES', 'NO_CUMPLE'],
            },
            dictamen_general: { type: Type.STRING },
            auditoria_por_criterio: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterio: { type: Type.STRING },
                  cumple: { type: Type.BOOLEAN },
                  observacion: { type: Type.STRING },
                  recomendacion_concreta: { type: Type.STRING },
                },
                required: ['criterio', 'cumple', 'observacion', 'recomendacion_concreta'],
              },
            },
            examen_adaptado: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  numero: { type: Type.STRING },
                  enunciado_original: { type: Type.STRING },
                  enunciado_adaptado: { type: Type.STRING },
                  justificacion_adaptacion: { type: Type.STRING },
                  tipo_adaptacion: { type: Type.STRING },
                  criterio_dua: { type: Type.STRING },
                  consejo_aula: { type: Type.STRING },
                  complejidad_original: { type: Type.NUMBER },
                  complejidad_adaptada: { type: Type.NUMBER },
                },
                required: ['numero', 'enunciado_original', 'enunciado_adaptado', 'justificacion_adaptacion', 'tipo_adaptacion', 'criterio_dua', 'consejo_aula', 'complejidad_original', 'complejidad_adaptada'],
              },
            },
          },
          required: [
            'puntuacion_accesibilidad',
            'estado_cumplimiento',
            'dictamen_general',
            'auditoria_por_criterio',
            'examen_adaptado',
          ],
        },
      },
    });

    const resultado = JSON.parse(respuesta.text || '{}');
    return Response.json(resultado, { status: 200 });
  } catch (error) {
    console.error('Error en /api/auditar-examen:', error);
    return Response.json(
      { error: 'Error al auditar el examen: ' + (error.message || 'Error desconocido') },
      { status: 500 }
    );
  }
}