import { z } from 'zod';

const FindAlternativesSchema = z.object({
  denied_drug: z.string().min(1, "Denied medication name is required"),
  patient_condition: z.string().min(1, "Patient condition is required"),
  insurance_plan: z.string().optional(),
  previous_treatments: z.array(z.string()).optional()
});

async function findAlternativeMedicationsHandler(input: z.infer<typeof FindAlternativesSchema>) {
  const validatedInput = FindAlternativesSchema.parse(input);
  
  // Mock alternative medications data
  const alternatives = generateMockAlternatives(validatedInput.denied_drug, validatedInput.patient_condition);
  
  return {
    success: true,
    denied_medication: validatedInput.denied_drug,
    condition: validatedInput.patient_condition,
    alternatives,
    message: formatAlternativesMessage(validatedInput.denied_drug, alternatives)
  };
}

function generateMockAlternatives(deniedDrug: string, condition: string) {
  // This would integrate with a real formulary database
  return [
    {
      name: "Adalimumab Biosimilar",
      brand_names: ["Amjevita", "Cyltezo"],
      coverage_likelihood: "High",
      pa_required: false,
      cost_tier: "Preferred",
      notes: "Biosimilar to original medication, often covered without PA"
    },
    {
      name: "Etanercept",
      brand_names: ["Enbrel"],
      coverage_likelihood: "Medium",
      pa_required: true,
      cost_tier: "Specialty",
      notes: "Different mechanism but similar effectiveness"
    }
  ];
}

function formatAlternativesMessage(deniedDrug: string, alternatives: any[]): string {
  return `🔄 **Alternative Medications for ${deniedDrug}**

We found ${alternatives.length} potential alternatives that may be covered by your insurance:

${alternatives.map((alt, index) => `
**${index + 1}. ${alt.name}** (${alt.brand_names.join(', ')})
• Coverage Likelihood: ${alt.coverage_likelihood}
• Prior Auth Required: ${alt.pa_required ? 'Yes' : 'No'}
• Cost Tier: ${alt.cost_tier}
• Notes: ${alt.notes}
`).join('\n')}

💡 **Next Steps:**
• Discuss these options with your doctor
• Your doctor can prescribe an alternative that's more likely to be covered
• If needed, we can help submit a new PA request for the chosen alternative`;
}

export const findAlternativeMedicationsTool = {
  name: "find_alternative_medications",
  description: "Find alternative medications when a prior authorization is denied. Suggests covered alternatives based on patient condition and insurance plan.",
  inputSchema: FindAlternativesSchema,
  handler: findAlternativeMedicationsHandler,
};