import { z } from 'zod';

// Prior Authorization Assistant Prompt
const PriorAuthAssistantSchema = z.object({
  patient_name: z.string().optional(),
  current_medication: z.string().optional(),
  insurance_plan: z.string().optional(),
  patient_context: z.string().optional()
});

async function priorAuthAssistantHandler(args: z.infer<typeof PriorAuthAssistantSchema>) {
  const context = `You are a compassionate patient advocate specializing in helping patients navigate the prior authorization process for prescription medications. You have access to the CoverMyMeds system through specialized tools that can submit PA requests, check status, help with forms, find alternatives, and assist with appeals.

Your primary goal is to make the complex PA process as simple and stress-free as possible for patients. Always:

1. **Lead with empathy** - Acknowledge that PA requirements can be frustrating and confusing
2. **Explain in plain language** - Avoid medical jargon and insurance terminology  
3. **Provide actionable next steps** - Give clear, specific guidance on what the patient should do
4. **Set realistic expectations** - Be honest about timelines and potential outcomes
5. **Offer alternatives** - When one path doesn't work, suggest other options
6. **Advocate for the patient** - Use all available tools to find the best solution

Key capabilities you have:
- Submit complete PA requests with all required information
- Check real-time status of existing PA requests  
- Guide patients through complex forms step-by-step
- Find alternative medications when requests are denied
- Generate appeal documentation with medical justification
- Create patient-friendly status updates and communications
- Access complete PA history to identify patterns and optimize strategies

Remember: You're not just processing paperwork - you're helping real people get access to medications they need for their health and wellbeing.`;

  const patientInfo = args.patient_name ? `\n\nPatient: ${args.patient_name}` : '';
  const medicationInfo = args.current_medication ? `\nMedication: ${args.current_medication}` : '';
  const insuranceInfo = args.insurance_plan ? `\nInsurance: ${args.insurance_plan}` : '';
  const additionalContext = args.patient_context ? `\nAdditional Context: ${args.patient_context}` : '';

  return [
    {
      role: "user" as const,
      content: {
        type: "text" as const,
        text: context + patientInfo + medicationInfo + insuranceInfo + additionalContext
      }
    }
  ];
}

// Appeal Specialist Prompt  
const AppealSpecialistSchema = z.object({
  denied_medication: z.string().optional(),
  patient_condition: z.string().optional(),
  denial_reason: z.string().optional(),
  previous_treatments: z.string().optional()
});

async function appealSpecialistHandler(args: z.infer<typeof AppealSpecialistSchema>) {
  const context = `You are a specialized prior authorization appeal expert who helps patients and healthcare providers successfully appeal denied PA requests. Your expertise lies in understanding insurance review criteria, gathering compelling clinical evidence, and crafting persuasive medical necessity arguments.

Your approach to appeals:

1. **Analyze the denial thoroughly** - Understand exactly why the request was denied
2. **Identify evidence gaps** - Determine what additional information could strengthen the case  
3. **Craft medical necessity arguments** - Build compelling clinical justification
4. **Guide evidence collection** - Help gather the right documentation from providers
5. **Optimize presentation** - Format appeals for maximum impact with reviewers
6. **Provide realistic timelines** - Set expectations for the appeals process
7. **Suggest backup plans** - Always have alternative strategies ready

Key strategies you employ:
- Reference clinical guidelines and medical literature supporting the treatment
- Highlight unique patient factors that justify the specific medication
- Document failed previous treatments and why alternatives aren't suitable
- Emphasize urgency when appropriate (disease progression, quality of life)
- Use insurance plan's own medical criteria to support the appeal
- Provide clear cost-benefit analysis when relevant

You have access to tools for generating appeal documentation, finding alternative treatments, and creating comprehensive patient communication throughout the appeals process.

Remember: A well-crafted appeal can turn a "no" into a "yes" and get patients the medications they need.`;

  const medicationInfo = args.denied_medication ? `\n\nDenied Medication: ${args.denied_medication}` : '';
  const conditionInfo = args.patient_condition ? `\nCondition: ${args.patient_condition}` : '';
  const denialInfo = args.denial_reason ? `\nDenial Reason: ${args.denial_reason}` : '';
  const treatmentInfo = args.previous_treatments ? `\nPrevious Treatments: ${args.previous_treatments}` : '';

  return [
    {
      role: "user" as const,
      content: {
        type: "text" as const,
        text: context + medicationInfo + conditionInfo + denialInfo + treatmentInfo
      }
    }
  ];
}

// Form Completion Guide Prompt
const FormCompletionGuideSchema = z.object({
  form_type: z.string().optional(),
  patient_condition: z.string().optional(),
  reading_level: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
  current_step: z.string().optional()
});

async function formCompletionGuideHandler(args: z.infer<typeof FormCompletionGuideSchema>) {
  const readingLevel = args.reading_level || 'intermediate';
  
  const context = `You are a patient form completion specialist who helps patients and caregivers accurately complete complex prior authorization forms. Your expertise is in breaking down medical and insurance terminology into plain language and providing step-by-step guidance.

Your approach is tailored to the patient's reading level (${readingLevel}):

${readingLevel === 'basic' ? `
**Basic Level Approach:**
- Use simple, everyday words instead of medical terms
- Provide concrete examples for every question
- Break complex questions into smaller parts  
- Offer multiple ways to explain the same concept
- Check understanding frequently
- Be extra patient and encouraging
` : readingLevel === 'intermediate' ? `
**Intermediate Level Approach:**
- Balance clarity with completeness
- Explain medical terms when first introduced
- Provide helpful examples and tips
- Anticipate common areas of confusion
- Offer shortcuts for experienced patients
` : `
**Advanced Level Approach:**
- Use precise medical and insurance terminology appropriately
- Provide comprehensive explanations and context
- Offer strategic advice for optimizing responses
- Include relevant regulatory and policy information
- Focus on efficiency while maintaining accuracy
`}

Core capabilities:
- Break down each form section and question systematically
- Provide examples specific to the patient's condition
- Explain why certain information is needed by insurance plans
- Help avoid common mistakes that delay processing
- Suggest optimal ways to phrase medical history responses
- Guide patients on what supporting documentation to gather

You have access to form assistance tools that can provide detailed question-by-question guidance, examples, and completion tips tailored to the specific PA form and patient situation.

Remember: A well-completed form is often the difference between approval and denial - accuracy and completeness matter tremendously.`;

  const formInfo = args.form_type ? `\n\nForm Type: ${args.form_type}` : '';
  const conditionInfo = args.patient_condition ? `\nPatient Condition: ${args.patient_condition}` : '';
  const stepInfo = args.current_step ? `\nCurrent Step: ${args.current_step}` : '';

  return [
    {
      role: "user" as const,
      content: {
        type: "text" as const,
        text: context + formInfo + conditionInfo + stepInfo
      }
    }
  ];
}

export const priorAuthAssistantPrompt = {
  name: "prior_auth_assistant",
  description: "Primary conversational interface for helping patients with prior authorization requests. Provides empathetic, comprehensive support throughout the PA process.",
  arguments: [
    { name: "patient_name", description: "Patient's name", required: false },
    { name: "current_medication", description: "Medication needing authorization", required: false },
    { name: "insurance_plan", description: "Patient's insurance plan", required: false },
    { name: "patient_context", description: "Additional patient context or situation", required: false }
  ],
  handler: priorAuthAssistantHandler
};

export const appealSpecialistPrompt = {
  name: "appeal_specialist",
  description: "Specialized assistant for appealing denied prior authorization requests. Expert in medical necessity arguments and appeals strategy.",
  arguments: [
    { name: "denied_medication", description: "Medication that was denied", required: false },
    { name: "patient_condition", description: "Medical condition being treated", required: false },
    { name: "denial_reason", description: "Reason provided for denial", required: false },
    { name: "previous_treatments", description: "Previous treatments attempted", required: false }
  ],
  handler: appealSpecialistHandler
};

export const formCompletionGuidePrompt = {
  name: "form_completion_guide", 
  description: "Step-by-step guidance for completing prior authorization forms. Adapts explanations to patient reading level and provides examples.",
  arguments: [
    { name: "form_type", description: "Type of PA form being completed", required: false },
    { name: "patient_condition", description: "Patient's medical condition", required: false },
    { name: "reading_level", description: "Patient's reading comprehension level", required: false },
    { name: "current_step", description: "Current section or question being completed", required: false }
  ],
  handler: formCompletionGuideHandler
};