#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { submitPriorAuthorizationTool } from "./tools/submitPriorAuthorization.js";
import { checkAuthorizationStatusTool } from "./tools/checkAuthorizationStatus.js";
import { helpPatientWithFormsTool } from "./tools/helpPatientWithForms.js";
import { findAlternativeMedicationsTool } from "./tools/findAlternativeMedications.js";
import { generateAppealAssistanceTool } from "./tools/generateAppealAssistance.js";
import { getPatientPaHistoryTool } from "./tools/getPatientPaHistory.js";
import { estimateApprovalTimelineTool } from "./tools/estimateApprovalTimeline.js";
import { createPatientCommunicationTool } from "./tools/createPatientCommunication.js";

import { 
  priorAuthAssistantPrompt,
  appealSpecialistPrompt,
  formCompletionGuidePrompt 
} from "./prompts/index.js";

// Define all available tools
const TOOLS = [
  submitPriorAuthorizationTool,
  checkAuthorizationStatusTool,
  helpPatientWithFormsTool,
  findAlternativeMedicationsTool,
  generateAppealAssistanceTool,
  getPatientPaHistoryTool,
  estimateApprovalTimelineTool,
  createPatientCommunicationTool,
];

// Define all available prompts
const PROMPTS = [
  priorAuthAssistantPrompt,
  appealSpecialistPrompt,
  formCompletionGuidePrompt,
];

class CmmMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "cmm-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private zodToJsonSchema(zodSchema: any): any {
    // Simple conversion of Zod schema to JSON schema properties
    // This is a basic implementation for the specific schemas used
    const shape = zodSchema._def?.shape || {};
    const properties: any = {};

    for (const [key, value] of Object.entries(shape)) {
      const zodField = value as any;
      const fieldDef = zodField._def;
      
      if (fieldDef?.typeName === 'ZodString') {
        properties[key] = {
          type: "string",
          description: fieldDef.description || `${key} parameter`
        };
        if (fieldDef.checks) {
          const minLength = fieldDef.checks.find((c: any) => c.kind === 'min');
          if (minLength) properties[key].minLength = minLength.value;
        }
      } else if (fieldDef?.typeName === 'ZodNumber') {
        properties[key] = {
          type: "number",
          description: fieldDef.description || `${key} parameter`
        };
      } else if (fieldDef?.typeName === 'ZodBoolean') {
        properties[key] = {
          type: "boolean",
          description: fieldDef.description || `${key} parameter`
        };
      } else if (fieldDef?.typeName === 'ZodOptional') {
        // Handle optional fields
        const innerType = fieldDef.innerType._def;
        if (innerType?.typeName === 'ZodString') {
          properties[key] = {
            type: "string",
            description: innerType.description || `${key} parameter (optional)`
          };
        }
      } else {
        // Default to string for unknown types
        properties[key] = {
          type: "string",
          description: `${key} parameter`
        };
      }
    }

    return properties;
  }

  private getRequiredFields(zodSchema: any): string[] {
    const shape = zodSchema._def?.shape || {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodField = value as any;
      const fieldDef = zodField._def;
      
      // If it's not optional, it's required
      if (fieldDef?.typeName !== 'ZodOptional') {
        required.push(key);
      }
    }

    return required;
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: {
            type: "object",
            properties: this.zodToJsonSchema(tool.inputSchema),
            required: this.getRequiredFields(tool.inputSchema),
          },
        })),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const tool = TOOLS.find(t => t.name === name);
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await tool.handler(args as any || {});
        return {
          content: [
            {
              type: "text",
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text", 
              text: `Error executing tool ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: PROMPTS.map(prompt => ({
          name: prompt.name,
          description: prompt.description,
          arguments: prompt.arguments,
        })),
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const prompt = PROMPTS.find(p => p.name === name);
      if (!prompt) {
        throw new Error(`Unknown prompt: ${name}`);
      }

      const messages = await prompt.handler(args as any || {});
      return {
        messages,
      };
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("CoverMyMeds MCP Server running on stdio");
  }
}

// Start the server
const server = new CmmMcpServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});