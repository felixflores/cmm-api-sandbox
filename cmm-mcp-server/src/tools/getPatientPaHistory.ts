import { z } from 'zod';

const GetHistorySchema = z.object({
  patient_identifier: z.string().min(1),
  date_range: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  medication_class: z.string().optional()
});

async function getPatientPaHistoryHandler(input: z.infer<typeof GetHistorySchema>) {
  const mockHistory = [
    {
      id: "req_001",
      medication: "Humira",
      status: "APPROVED",
      submitted_date: "2023-11-01",
      decision_date: "2023-11-03"
    },
    {
      id: "req_002", 
      medication: "Enbrel",
      status: "DENIED",
      submitted_date: "2023-10-15",
      decision_date: "2023-10-17"
    }
  ];

  return {
    success: true,
    patient: input.patient_identifier,
    history: mockHistory,
    message: `📈 **PA History for ${input.patient_identifier}**\n\nFound ${mockHistory.length} previous requests.`
  };
}

export const getPatientPaHistoryTool = {
  name: "get_patient_pa_history",
  description: "Retrieve complete prior authorization history for a patient",
  inputSchema: GetHistorySchema,
  handler: getPatientPaHistoryHandler,
};