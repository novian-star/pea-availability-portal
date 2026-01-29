import z4 from 'zod';
import { SheetService } from '~~/server/services/sheet';

interface RequestBody {
  prompt: string;
  region: string;
  type: 'frtu' | 'substation';
}

const VALID_TYPES = ['frtu', 'substation'] as const;

const SYSTEM_INSTRUCTION =
  'นายเป็นผู้ช่วยที่เชี่ยวชาญด้านการวิเคราะห์ข้อมูล ซึ่งข้อมูลจะเกี่ยวกับสถานะการทำงานของอุปกรณ์ในระบบไฟฟ้า โปรดวิเคราะห์และตอบคำถามที่ได้รับอย่างสั้น ๆ และชัดเจน ถ้าผู้ใช้ถามถึงบทสนทนาก่อนหน้า ให้อธิบายเรื่องข้อจำกัดการเข้าถึงข้อมูลของนาย และแนะนำให้ผู้ใช้ถามคำถามใหม่ที่เกี่ยวข้องกับข้อมูลที่มีอยู่';

const schema = z4.object({
  prompt: z4.string().trim(),
  region: z4
    .string()
    .regex(
      /^(C|N|NE|S)(1|2|3)$/,
      'Region ต้องอยู่ในรูปแบบ C1, C2, C3, N1, N2, N3, NE1, NE2, NE3, หรือ S1, S2, S3',
    ),
  type: z4.enum(VALID_TYPES, {
    errorMap: () => ({
      message: `Type ต้องเป็นหนึ่งใน: ${VALID_TYPES.join(', ')}`,
    }),
  }),
});

export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: async (event) => {
    const body = await readValidatedBody(event, schema.parse);

    try {
      const data = await fetchSheetData(body.region, body.type);
      const aiResponse = await generateAIResponse(body.prompt, data);

      return { data: aiResponse };
    } catch (error) {
      console.error('Error processing AI request:', error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to process request',
      });
    }
  },
});

async function fetchSheetData(region: string, type: RequestBody['type']) {
  const sheets = useGoogleSheets(
    useGoogleAuth(['https://www.googleapis.com/auth/spreadsheets.readonly']),
  );
  const sheetService = new SheetService(sheets);

  return type === 'frtu'
    ? sheetService.fetchFrtuSheetData(region)
    : sheetService.fetchSubstationSheetData(region);
}

async function generateAIResponse(
  prompt: string,
  data: Record<string, unknown>[],
) {
  const googleGenAI = useGoogleGenAI();

  const indexedData = data.map((item, index) => ({ id: index + 1, ...item }));

  const promptWithJson = `
		${prompt}
		
		ข้อมูล JSON: 
		${JSON.stringify(indexedData, null, 2)}
		`;

  const response = await googleGenAI.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: promptWithJson,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });

  return response.text;
}
