# CoverMyMeds MCP Server

A Model Context Protocol (MCP) server that provides high-level tools for assisting patients with Prior Authorization (PA) requests. This server abstracts away the complexity of the CMM API and provides patient-focused tools that healthcare agents can use to help patients navigate the PA process.

## 🎯 Purpose

This MCP server transforms low-level API operations into high-level patient assistance workflows:

- **API Level**: `POST /requests` with complex parameters
- **MCP Level**: `submit_prior_authorization` for "Help John get Humira approved in Ohio"

## 🛠 Tools Available

### Core PA Workflow Tools

1. **`submit_prior_authorization`**
   - Submit complete PA requests with patient-friendly input
   - Automatic validation and error handling
   - Clear next steps and timeline information

2. **`check_authorization_status`**
   - Check PA status by patient name or request ID
   - Human-readable status updates with timeline
   - Actionable next steps for patients

3. **`help_patient_with_forms`**
   - Step-by-step form completion guidance
   - Adapts to patient reading level
   - Examples and common mistake prevention

4. **`find_alternative_medications`**
   - Suggest covered alternatives for denied medications
   - Coverage likelihood and PA requirements
   - Cost tier information

5. **`generate_appeal_assistance`**
   - Create appeal documentation for denied requests
   - Medical necessity arguments
   - Appeal submission guidance

6. **`get_patient_pa_history`**
   - Complete PA history for pattern analysis
   - Chronological timeline view
   - Insights for optimization

7. **`estimate_approval_timeline`**
   - Predict decision timeframes
   - Factors affecting processing speed
   - Confidence levels

8. **`create_patient_communication`**
   - Generate patient-friendly updates
   - Multiple formats (email, letter, phone script)
   - Reading level adaptation

## 🎭 Prompts Available

### `prior_auth_assistant`
Primary conversational interface for PA help. Provides empathetic, comprehensive support throughout the PA process.

**Use case**: General PA assistance and patient advocacy

### `appeal_specialist` 
Specialized assistant for appealing denied PA requests. Expert in medical necessity arguments and appeals strategy.

**Use case**: When PA is denied and appeal is needed

### `form_completion_guide`
Step-by-step guidance for completing PA forms. Adapts explanations to patient reading level.

**Use case**: When patient needs help filling out complex forms

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- CMM API backend running on `http://localhost:3000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm run dev
   ```

### Claude Desktop Integration

1. **Copy the configuration template**:
   ```bash
   cp claude-desktop-config.json ~/.claude-desktop-config.json
   ```

2. **Update the path** in your copied config file:
   - Replace `/path/to/cmm-mcp-server` with your actual project path
   - For example: `/Users/yourname/Projects/cmmdemo/cmm-mcp-server`

3. **Restart Claude Desktop** to load the new MCP server

#### Configuration Options

**For Production (recommended)**:
```json
{
  "mcpServers": {
    "cmm-mcp-server": {
      "command": "node", 
      "args": ["dist/server.js"],
      "cwd": "/path/to/cmm-mcp-server",
      "env": {
        "CMM_API_URL": "http://localhost:3000",
        "CMM_API_KEY": "demo-api-key"
      }
    }
  }
}
```

**For Development**:
```json
{
  "mcpServers": {
    "cmm-mcp-server": {
      "command": "npx",
      "args": ["tsx", "src/server.ts"],
      "cwd": "/path/to/cmm-mcp-server",
      "env": {
        "CMM_API_URL": "http://localhost:3000", 
        "CMM_API_KEY": "demo-api-key"
      }
    }
  }
}
```

**Note**: For production use, first build the project with `npm run build`

## 💡 Example Usage

### Submit a Prior Authorization
```
Use the submit_prior_authorization tool to help Sarah Johnson get prior auth for Humira. She lives in Ohio, was born 1985-03-15, and needs it for rheumatoid arthritis. Her doctor thinks she needs this specific medication because she tried methotrexate for 6 months without improvement.
```

### Check Status
```
Check the authorization status for patient "John Smith" to see if his Humira request has been processed.
```

### Help with Forms
```
Use help_patient_with_forms to guide an elderly patient through completing their PA form. They have basic reading level and need extra help understanding medical questions.
```

### Find Alternatives
```
Humira was denied for coverage. Use find_alternative_medications to help find covered alternatives for treating rheumatoid arthritis.
```

## 🏗 Architecture

### High-Level Design
```
Claude Desktop → MCP Protocol → CMM MCP Server → CMM API → Backend
```

### Tool Flow
1. **Natural Language Input**: "Help John get Humira approved"
2. **MCP Tool Invocation**: `submit_prior_authorization` with structured params
3. **API Translation**: Convert to appropriate CMM API calls
4. **Response Enhancement**: Add patient-friendly context and next steps
5. **Result**: Comprehensive assistance with clear guidance

### Data Flow
- **Input**: Patient-focused, natural language descriptions
- **Processing**: Validation, API calls, error handling, response formatting
- **Output**: Actionable, empathetic, patient-friendly information

## 🔧 Configuration

### Environment Variables
- `CMM_API_URL`: CMM API base URL (default: http://localhost:3000)
- `CMM_API_KEY`: API key for authentication (default: demo-api-key)

### Customization
- Modify reading level adaptations in prompts
- Adjust timeline estimates based on real data
- Customize alternative medication databases
- Add organization-specific templates

## 🧪 Testing

### Manual Testing
```bash
# Start the MCP server
npm run dev

# Test with MCP Inspector (if available)
npx @modelcontextprotocol/inspector

# Or test individual tools programmatically
```

### Integration Testing
1. Start CMM API backend: `npm run dev` (in backend directory)
2. Start MCP server: `npm run dev` (in mcp-server directory)  
3. Configure Claude Desktop with MCP server
4. Test patient assistance workflows

## 📚 Use Cases

### For Healthcare Agents
- **Patient Advocacy**: "Help Mrs. Rodriguez navigate her Humira PA denial"
- **Form Assistance**: "Guide this patient through the complex diabetes PA form"
- **Status Updates**: "Check on all pending PAs for our clinic patients"
- **Appeal Support**: "Create an appeal for the denied Enbrel request"

### For Patients Directly
- **Self-Service**: "Check my PA status and next steps"
- **Education**: "Explain why my medication needs prior authorization"
- **Alternatives**: "What other medications might be covered?"
- **Timeline**: "When will I hear back about my request?"

### For Healthcare Providers
- **Efficiency**: "Submit PAs for multiple patients quickly"
- **Strategy**: "What's the best approach for this complex case?"
- **Documentation**: "Generate clinical justification for appeal"
- **Tracking**: "Monitor all my practice's pending PAs"

## 🔮 Future Enhancements

- **Real-time notifications** when PA status changes
- **Predictive analytics** for approval likelihood
- **Integration with EHR systems** for automatic data population
- **Multi-language support** for diverse patient populations
- **Machine learning** for optimizing PA submission strategies
- **Pharmacy integration** for seamless prescription fulfillment

## 🤝 Contributing

This MCP server is designed to be a reference implementation for patient-focused healthcare automation. Contributions that improve patient outcomes and reduce administrative burden are welcome.

## 📄 License

ISC License - See main project for details.