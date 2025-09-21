import { Agent } from "@mastra/core/agent";
import { MCPServer } from "@mastra/mcp";
import { MCPClient } from "@mastra/mcp";
import { google } from '@ai-sdk/google';

const myAgent = new Agent({
  name: "My Agent",
  description: "An agent that can use tools from an http MCP server",
  instructions: "You can use remote calculation tools.",
  model: google("gemini-2.5-flash"),
  tools: async () => {
    // Tools resolve when needed, not during initialization
    const mcpClient = new MCPClient({
      servers: {
        myServer: {
          url: new URL("http://localhost:4111/api/mcp/mcpServer/mcp"),
        },
      },
    });
    return await mcpClient.getTools();
  },
});
 
// This works because tools resolve after server startup
export const mcpServer = new MCPServer({
  name: "My MCP Server",
  agents: {
    myAgent
  },
});