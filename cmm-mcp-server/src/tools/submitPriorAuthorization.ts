import { z } from 'zod';
import { CmmApiClient, type PriorAuthRequest } from '../api/cmmClient.js';

const SubmitPriorAuthSchema = z.object({
  patient_info: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  }),
  prescription: z.object({
    drug_name: z.string().min(1, "Drug name is required"),
    ndc_code: z.string().optional(),
    quantity: z.number().positive().optional(),
    days_supply: z.number().positive().optional()
  }),
  state: z.string().length(2, "State must be 2-letter code"),
  insurance_info: z.object({
    plan_name: z.string().optional(),
    member_id: z.string().optional()
  }).optional(),
  clinical_notes: z.string().optional()
});

type SubmitPriorAuthInput = z.infer<typeof SubmitPriorAuthSchema>;

async function submitPriorAuthorizationHandler(input: SubmitPriorAuthInput) {
  try {
    // Validate input
    const validatedInput = SubmitPriorAuthSchema.parse(input);
    
    const client = new CmmApiClient();
    
    // Validate state code
    if (!client.validateState(validatedInput.state)) {
      throw new Error(`Invalid state code: ${validatedInput.state}. Must be a valid US state abbreviation.`);
    }

    // Build the API request
    const request: PriorAuthRequest = {
      state: validatedInput.state.toUpperCase(),
      patient: validatedInput.patient_info,
      prescription: {
        drug_id: validatedInput.prescription.drug_name, // Using drug_name as drug_id for now
        drug_name: validatedInput.prescription.drug_name,
        ndc_code: validatedInput.prescription.ndc_code,
        quantity: validatedInput.prescription.quantity,
        days_supply: validatedInput.prescription.days_supply
      },
      memo: validatedInput.clinical_notes
    };

    // Submit the prior authorization request
    const response = await client.createPriorAuthRequest(request);

    // Create tokens for the request to enable status checking
    let tokens: any[] = [];
    try {
      const tokenResponse = await client.createTokens([response.id]);
      tokens = tokenResponse.tokens;
    } catch (error) {
      console.warn('Could not create tokens (may require basic auth):', error);
    }

    // Format patient-friendly response
    const result = {
      success: true,
      request_id: response.id,
      status: response.status,
      workflow_status: response.workflow_status,
      patient_name: `${response.patient.first_name} ${response.patient.last_name}`,
      medication: response.prescription.drug_name || response.prescription.drug_id,
      state: response.state,
      submitted_at: response.created_at,
      next_steps: generateNextSteps(response, tokens),
      tracking_info: tokens.length > 0 ? {
        tracking_url: tokens[0]?.html_url,
        pdf_url: tokens[0]?.pdf_url
      } : null
    };

    return {
      result,
      message: `✅ Prior authorization request submitted successfully for ${result.patient_name}!
      
📋 **Request Details:**
- Request ID: ${result.request_id}
- Patient: ${result.patient_name}
- Medication: ${result.medication}
- State: ${result.state}
- Status: ${result.status}
- Workflow Status: ${result.workflow_status}

🔄 **Next Steps:**
${result.next_steps.map(step => `• ${step}`).join('\n')}

${result.tracking_info ? `🔗 **Tracking:**
- View Status: ${result.tracking_info.tracking_url}
- Download PDF: ${result.tracking_info.pdf_url}` : ''}

ℹ️  The request is now in the system and will be processed according to the patient's insurance plan requirements.`
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `• ${issue.path.join('.')}: ${issue.message}`).join('\n');
      return {
        success: false,
        error: "Validation Error",
        message: `❌ **Invalid input provided:**\n\n${issues}\n\nPlease correct these issues and try again.`
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: "Submission Failed",
      message: `❌ **Failed to submit prior authorization:**\n\n${errorMessage}\n\nPlease check the patient information and try again, or contact support if the issue persists.`
    };
  }
}

function generateNextSteps(response: any, tokens: any[]): string[] {
  const steps = [];
  
  if (response.status === 'PENDING') {
    steps.push("Wait for insurance plan review (typically 24-72 hours)");
    steps.push("Monitor status using the tracking URL provided");
  }
  
  if (response.workflow_status === 'NEW') {
    steps.push("Insurance plan may request additional documentation");
    steps.push("Check for any required forms using the request ID");
  }
  
  steps.push("Patient will be notified of decision via their preferred contact method");
  steps.push("If approved, prescription can be filled at pharmacy");
  steps.push("If denied, review appeal options and alternative medications");
  
  return steps;
}

export const submitPriorAuthorizationTool = {
  name: "submit_prior_authorization",
  description: "Submit a complete prior authorization request for a patient's medication. This tool handles the entire PA submission process, validates all required information, and provides patient-friendly status updates and next steps.",
  inputSchema: SubmitPriorAuthSchema,
  handler: submitPriorAuthorizationHandler,
};