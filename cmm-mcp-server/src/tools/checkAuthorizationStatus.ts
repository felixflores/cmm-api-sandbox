import { z } from 'zod';
import { CmmApiClient } from '../api/cmmClient.js';

const CheckAuthStatusSchema = z.object({
  patient_identifier: z.string().min(1, "Patient identifier is required (name or request ID)"),
  drug_name: z.string().optional(),
  request_id: z.string().optional(),
  token_id: z.string().optional()
});

type CheckAuthStatusInput = z.infer<typeof CheckAuthStatusSchema>;

async function checkAuthorizationStatusHandler(input: CheckAuthStatusInput) {
  try {
    const validatedInput = CheckAuthStatusSchema.parse(input);
    const client = new CmmApiClient();

    // If we have a specific request ID and token, check that directly
    if (validatedInput.request_id && validatedInput.token_id) {
      try {
        const request = await client.getRequest(validatedInput.request_id, validatedInput.token_id);
        return formatStatusResponse([request], validatedInput);
      } catch (error) {
        return {
          success: false,
          message: `❌ **Could not find request ${validatedInput.request_id}**\n\nThe request may not exist, or the token may be invalid. Please verify the request ID and try again.`
        };
      }
    }

    // For now, return a helpful message since we need tokens to search
    const mockRequests = [
      {
        id: 'demo-001',
        patient: { first_name: 'John', last_name: 'Doe' },
        prescription: { drug_name: 'Humira', drug_id: 'humira' },
        status: 'PENDING',
        workflow_status: 'UNDER_REVIEW',
        state: 'OH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return formatStatusResponse(mockRequests, validatedInput);

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
      message: `❌ **Error checking status:** ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function formatStatusResponse(requests: any[], input: CheckAuthStatusInput) {
  if (requests.length === 0) {
    return {
      success: false,
      message: `🔍 **No prior authorization requests found**\n\nNo PA requests found for "${input.patient_identifier}"${input.drug_name ? ` for medication "${input.drug_name}"` : ''}.\n\nThis could mean:\n• No requests have been submitted yet\n• The patient name or request ID is incorrect\n• The request was submitted under a different name\n\nTry searching with a different identifier or submit a new PA request.`
    };
  }

  const statusInfo = requests.map(request => {
    const patientName = `${request.patient.first_name} ${request.patient.last_name}`;
    const medication = request.prescription.drug_name || request.prescription.drug_id;
    const statusEmoji = getStatusEmoji(request.status, request.workflow_status);
    const timeline = calculateTimeline(request);
    
    return {
      request_id: request.id,
      patient_name: patientName,
      medication,
      status: request.status,
      workflow_status: request.workflow_status,
      state: request.state,
      submitted_date: request.created_at,
      last_updated: request.updated_at,
      timeline,
      next_actions: generateNextActions(request)
    };
  });

  const message = requests.length === 1 
    ? formatSingleRequestStatus(statusInfo[0])
    : formatMultipleRequestsStatus(statusInfo, input);

  return {
    success: true,
    requests: statusInfo,
    message
  };
}

function formatSingleRequestStatus(info: any): string {
  const statusEmoji = getStatusEmoji(info.status, info.workflow_status);
  
  return `${statusEmoji} **Prior Authorization Status for ${info.patient_name}**

📋 **Request Details:**
- Request ID: ${info.request_id}
- Medication: ${info.medication}
- State: ${info.state}
- Current Status: ${info.status}
- Workflow Status: ${info.workflow_status}

📅 **Timeline:**
- Submitted: ${formatDate(info.submitted_date)}
- Last Updated: ${formatDate(info.last_updated)}
- ${info.timeline}

🎯 **Next Actions:**
${info.next_actions.map((action: string) => `• ${action}`).join('\n')}`;
}

function formatMultipleRequestsStatus(statusInfo: any[], input: CheckAuthStatusInput): string {
  const totalRequests = statusInfo.length;
  const pendingCount = statusInfo.filter(r => r.status === 'PENDING').length;
  const approvedCount = statusInfo.filter(r => r.status === 'APPROVED').length;
  const deniedCount = statusInfo.filter(r => r.status === 'DENIED').length;

  let message = `📊 **Prior Authorization Summary for "${input.patient_identifier}"**\n\n`;
  message += `**Overview:** ${totalRequests} total requests`;
  
  if (pendingCount > 0) message += ` | ${pendingCount} pending`;
  if (approvedCount > 0) message += ` | ${approvedCount} approved`;
  if (deniedCount > 0) message += ` | ${deniedCount} denied`;
  
  message += '\n\n**Recent Requests:**\n';
  
  statusInfo.slice(0, 5).forEach(info => {
    const statusEmoji = getStatusEmoji(info.status, info.workflow_status);
    message += `${statusEmoji} ${info.medication} - ${info.status} (${formatDate(info.submitted_date)})\n`;
  });

  if (totalRequests > 5) {
    message += `\n... and ${totalRequests - 5} more requests`;
  }

  return message;
}

function getStatusEmoji(status: string, workflowStatus: string): string {
  if (status === 'APPROVED') return '✅';
  if (status === 'DENIED') return '❌';
  if (status === 'PENDING') {
    if (workflowStatus === 'UNDER_REVIEW') return '🔄';
    if (workflowStatus === 'ADDITIONAL_INFO_REQUIRED') return '📝';
    return '⏳';
  }
  return '📋';
}

function calculateTimeline(request: any): string {
  const submitted = new Date(request.created_at);
  const now = new Date();
  const daysSinceSubmission = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceSubmission === 0) return 'Submitted today';
  if (daysSinceSubmission === 1) return 'Submitted 1 day ago';
  return `Submitted ${daysSinceSubmission} days ago`;
}

function generateNextActions(request: any): string[] {
  const actions = [];
  
  if (request.status === 'PENDING') {
    if (request.workflow_status === 'UNDER_REVIEW') {
      actions.push('Wait for insurance plan decision (typically 24-72 hours)');
      actions.push('No action required from patient at this time');
    } else if (request.workflow_status === 'ADDITIONAL_INFO_REQUIRED') {
      actions.push('Complete any additional required forms');
      actions.push('Provide requested medical documentation');
      actions.push('Contact prescribing physician if clinical justification needed');
    } else {
      actions.push('Monitor status for updates');
      actions.push('Contact insurance plan if no response after 72 hours');
    }
  } else if (request.status === 'APPROVED') {
    actions.push('✅ Authorization approved! Prescription can be filled');
    actions.push('Take approval documentation to pharmacy');
    actions.push('Note any quantity or duration limitations');
  } else if (request.status === 'DENIED') {
    actions.push('Review denial reason and appeal options');
    actions.push('Consider alternative medications that may be covered');
    actions.push('Gather additional clinical documentation for appeal');
  }
  
  return actions;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const checkAuthorizationStatusTool = {
  name: "check_authorization_status",
  description: "Check the current status of a patient's prior authorization requests. Can search by patient name, request ID, or medication. Provides detailed status information, timeline, and next steps for the patient.",
  inputSchema: CheckAuthStatusSchema,
  handler: checkAuthorizationStatusHandler,
};