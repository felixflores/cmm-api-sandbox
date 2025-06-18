import { z } from 'zod';
import { CmmApiClient } from '../api/cmmClient.js';

const HelpWithFormsSchema = z.object({
  request_id: z.string().min(1, "Request ID is required"),
  token_id: z.string().optional(),
  patient_context: z.object({
    reading_level: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
    preferred_language: z.string().default('en'),
    assistance_needed: z.array(z.string()).optional()
  }).optional()
});

type HelpWithFormsInput = z.infer<typeof HelpWithFormsSchema>;

async function helpPatientWithFormsHandler(input: HelpWithFormsInput) {
  try {
    const validatedInput = HelpWithFormsSchema.parse(input);
    const client = new CmmApiClient();

    // For demonstration, we'll use mock form data
    // In a real implementation, this would fetch from client.getRequestPage()
    const mockFormData = {
      id: validatedInput.request_id,
      forms: [{
        identifier: `pa_form_${validatedInput.request_id}`,
        title: "Prior Authorization Request Form",
        question_sets: [{
          title: 'Patient Information',
          questions: [
            {
              question_id: 'q1',
              question_type: 'FREE_TEXT',
              question_text: 'Patient Name',
              flag: 'REQUIRED',
              help_text: 'Enter the full legal name as it appears on insurance card'
            },
            {
              question_id: 'q2', 
              question_type: 'DATE',
              question_text: 'Date of Birth',
              flag: 'REQUIRED',
              help_text: 'Format: MM/DD/YYYY'
            },
            {
              question_id: 'q3',
              question_type: 'CHOICE',
              question_text: 'Insurance Type',
              flag: 'REQUIRED',
              choices: [
                { code: 'COMMERCIAL', display: 'Commercial Insurance' },
                { code: 'MEDICARE', display: 'Medicare' },
                { code: 'MEDICAID', display: 'Medicaid' }
              ],
              help_text: 'Select the type that matches your insurance card'
            },
            {
              question_id: 'q4',
              question_type: 'FREE_TEXT',
              question_text: 'Medical History Relevant to Treatment',
              flag: 'OPTIONAL',
              help_text: 'Describe any previous treatments tried for this condition'
            },
            {
              question_id: 'q5',
              question_type: 'CHOICE',
              question_text: 'Have you tried other medications for this condition?',
              flag: 'REQUIRED',
              choices: [
                { code: 'YES', display: 'Yes, I have tried other medications' },
                { code: 'NO', display: 'No, this is my first treatment' }
              ]
            }
          ]
        }]
      }]
    };

    const readingLevel = validatedInput.patient_context?.reading_level || 'intermediate';
    const assistanceNeeded = validatedInput.patient_context?.assistance_needed || [];

    const formGuidance = generateFormGuidance(mockFormData, readingLevel, assistanceNeeded);

    return {
      success: true,
      request_id: validatedInput.request_id,
      form_guidance: formGuidance,
      message: formatFormGuidanceMessage(formGuidance, readingLevel)
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `• ${issue.path.join('.')}: ${issue.message}`).join('\n');
      return {
        success: false,
        message: `❌ **Invalid input:**\n\n${issues}`
      };
    }

    return {
      success: false,
      message: `❌ **Error accessing form:** ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function generateFormGuidance(formData: any, readingLevel: string, assistanceNeeded: string[]) {
  const form = formData.forms[0];
  const questions = form.question_sets[0].questions;

  return {
    form_title: form.title,
    total_questions: questions.length,
    required_questions: questions.filter((q: any) => q.flag === 'REQUIRED').length,
    estimated_time: estimateCompletionTime(questions),
    sections: [{
      title: form.question_sets[0].title,
      questions: questions.map((q: any) => formatQuestionGuidance(q, readingLevel))
    }],
    completion_tips: generateCompletionTips(readingLevel),
    common_mistakes: generateCommonMistakes(),
    help_resources: generateHelpResources()
  };
}

function formatQuestionGuidance(question: any, readingLevel: string) {
  const guidance: any = {
    id: question.question_id,
    text: question.question_text,
    type: question.question_type,
    required: question.flag === 'REQUIRED',
    help_text: question.help_text
  };

  // Add reading-level appropriate explanations
  if (readingLevel === 'basic') {
    guidance.simple_explanation = getSimpleExplanation(question);
  }

  // Add examples for complex questions
  if (question.question_type === 'FREE_TEXT' && question.question_text.includes('Medical History')) {
    guidance.examples = [
      "I tried ibuprofen for 6 months but it didn't help with my arthritis pain",
      "My doctor prescribed metformin first, but my blood sugar is still high",
      "I had physical therapy for 3 months before trying medication"
    ];
  }

  // Add format help for specific types
  if (question.question_type === 'DATE') {
    guidance.format_help = {
      example: "12/25/1985",
      tip: "Use the month/day/year format shown on your insurance card"
    };
  }

  if (question.choices) {
    guidance.choices = question.choices.map((choice: any) => ({
      code: choice.code,
      display: choice.display,
      when_to_choose: getChoiceGuidance(choice, question)
    }));
  }

  return guidance;
}

function getSimpleExplanation(question: any): string {
  const explanations: Record<string, string> = {
    'Patient Name': 'Write your full name exactly as it shows on your insurance card',
    'Date of Birth': 'Write when you were born (month/day/year)',
    'Insurance Type': 'Pick which kind of insurance you have',
    'Medical History Relevant to Treatment': 'Tell us about other medicines you tried for this health problem',
    'Have you tried other medications for this condition?': 'Have you taken other medicines for this same health issue before?'
  };
  
  return explanations[question.question_text] || question.help_text || 'Please provide the requested information';
}

function getChoiceGuidance(choice: any, question: any): string {
  if (question.question_text.includes('Insurance Type')) {
    const guidance: Record<string, string> = {
      'COMMERCIAL': 'Choose this if you get insurance through work or buy it yourself',
      'MEDICARE': 'Choose this if you are 65+ or have certain disabilities',
      'MEDICAID': 'Choose this if you have government insurance for low income'
    };
    return guidance[choice.code] || '';
  }
  
  return '';
}

function estimateCompletionTime(questions: any[]): string {
  const timePerQuestion = 2; // minutes
  const totalMinutes = questions.length * timePerQuestion;
  
  if (totalMinutes < 10) return 'About 5-10 minutes';
  if (totalMinutes < 20) return 'About 10-15 minutes';
  return 'About 15-20 minutes';
}

function generateCompletionTips(readingLevel: string): string[] {
  const basicTips = [
    "Have your insurance card ready",
    "Take your time - there's no rush",
    "Ask for help if you need it",
    "Save your work often if possible"
  ];

  const advancedTips = [
    "Gather insurance card, medical records, and previous prescription history",
    "Complete required fields first, then optional ones",
    "Be specific and detailed in medical history sections",
    "Double-check all dates and names for accuracy",
    "Save a copy of completed form for your records"
  ];

  return readingLevel === 'basic' ? basicTips : advancedTips;
}

function generateCommonMistakes(): string[] {
  return [
    "Using nickname instead of legal name from insurance card",
    "Entering date of birth in wrong format",
    "Leaving required medical history fields blank",
    "Not being specific enough about previous treatments",
    "Forgetting to save before submitting"
  ];
}

function generateHelpResources(): any[] {
  return [
    {
      type: "phone",
      title: "Patient Assistance Hotline", 
      contact: "1-800-XXX-XXXX",
      hours: "Monday-Friday 8AM-6PM EST"
    },
    {
      type: "online",
      title: "Form Completion Video Tutorial",
      url: "https://example.com/form-help"
    },
    {
      type: "chat",
      title: "Live Chat Support",
      available: "24/7 online assistance"
    }
  ];
}

function formatFormGuidanceMessage(guidance: any, readingLevel: string): string {
  const emoji = readingLevel === 'basic' ? '📝' : '📋';
  
  return `${emoji} **Form Completion Guide: ${guidance.form_title}**

⏱️ **Estimated Time:** ${guidance.estimated_time}
📊 **Questions:** ${guidance.total_questions} total (${guidance.required_questions} required)

📝 **Before You Start:**
${guidance.completion_tips.map((tip: string) => `• ${tip}`).join('\n')}

❗ **Common Mistakes to Avoid:**
${guidance.common_mistakes.map((mistake: string) => `• ${mistake}`).join('\n')}

📞 **Need Help?**
${guidance.help_resources.map((resource: any) => {
  if (resource.type === 'phone') return `• Call ${resource.contact} (${resource.hours})`;
  if (resource.type === 'online') return `• Watch tutorial: ${resource.url}`;
  if (resource.type === 'chat') return `• ${resource.title} - ${resource.available}`;
  return `• ${resource.title}`;
}).join('\n')}

🎯 **Ready to begin?** The form will guide you through each section step by step.`;
}

export const helpPatientWithFormsTool = {
  name: "help_patient_with_forms",
  description: "Provide step-by-step guidance for patients completing prior authorization forms. Adapts explanations to patient reading level and provides examples, tips, and common mistake prevention.",
  inputSchema: HelpWithFormsSchema,
  handler: helpPatientWithFormsHandler,
};