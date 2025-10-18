import { PinoLogger } from '@mastra/loggers'
import { FileTransport } from '@mastra/loggers/file'
import * as fs from 'node:fs'
import * as path from 'node:path'
import pino from 'pino'
// Use __dirname directly for CommonJS
//const __dirname: string = path.resolve(path.dirname(''));

// Ensure logs directory exists
const logsDir: string = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
}

export const log = new PinoLogger({
    name: 'MastraLogger',

    level: 'debug',

    formatters: {level: (label: string) => ({ level: label.toUpperCase() }), bindings: (bindings: object) => bindings as Record<string, unknown>,  log: (logObj: object) => logObj as Record<string, unknown>},
})

const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: 1 }, // stdout
      level: "trace",
    },
    {
      target: "pino-opentelemetry-transport",
      options: {},
      level: "trace",
    },
  ],
});

// Wait for the Pino worker threads to be set up
await new Promise((resolve) => setTimeout(resolve, 1000));

export const logger = pino(transport);
// Create a simple file logger wrapper
//
const logFilePath: string = path.join(logsDir, 'workflow.log')
const logToFile = (message: string, data?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
        timestamp,
        message,
        ...data,
    }
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n')
}

export const logWorkflowStart = (
    workflowId: string,
    input: Record<string, unknown>
) => {
    const message = `🚀 Starting workflow: ${workflowId}`
    const data: {
        workflowId: string
        input: Record<string, unknown>
        timestamp: string
    } = {
        workflowId,
        input,
        timestamp: new Date().toISOString(),
    }
    log.info(message, data)
    logToFile(message, data)
}

export const logWorkflowEnd = (
    workflowId: string,
    output: Record<string, unknown>,
    duration: number
) => {
    const message = `✅ Workflow completed: ${workflowId}`
    const data: {
        workflowId: string
        output: Record<string, unknown>
        duration: string
        timestamp: string
    } = {
        workflowId,
        output,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
    }
    log.info(message, data)
    logToFile(message, data)
}

export const logStepStart = (
    stepId: string,
    input: Record<string, unknown>
) => {
    const message = `📋 Starting step: ${stepId}`
    const data: {
        stepId: string
        input: Record<string, unknown>
        timestamp: string
    } = {
        stepId,
        input,
        timestamp: new Date().toISOString(),
    }
    log.info(message, data)
    logToFile(message, data)
}

export const logStepEnd = (
    stepId: string,
    output: Record<string, unknown>,
    duration: number
) => {
    const message = `✓ Step completed: ${stepId}`
    const data: {
        stepId: string
        output: Record<string, unknown>
        duration: string
        timestamp: string
    } = {
        stepId,
        output,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
    }
    log.info(message, data)
    logToFile(message, data)
}

export const logToolExecution = (
    toolId: string,
    input: Record<string, unknown>,
    output?: Record<string, unknown>
) => {
    const message = `🔧 Tool execution: ${toolId}`
    const data: {
        toolId: string
        input: Record<string, unknown>
        output?: Record<string, unknown>
        timestamp: string
    } = {
        toolId,
        input,
        output,
        timestamp: new Date().toISOString(),
    }
    log.info(message, data)
    logToFile(message, data)
}

export const logAgentActivity = (
    agentId: string,
    action: string,
    details: Record<string, unknown>
) => {
    const message = `🤖 Agent activity: ${agentId} - ${action}`
    const data: {
        agentId: string
        action: string
        details: Record<string, unknown>
        timestamp: string
    } = {
        agentId,
        action,
        details,
        timestamp: new Date().toISOString(),
    }
    log.info(message, data)
    logToFile(message, data)
}

export const logError = (
    component: string,
    error: Error | unknown,
    context?: Record<string, unknown>
) => {
    const message = `❌ Error in ${component}`
    const data: {
        component: string
        error: string
        stack?: string
        context?: Record<string, unknown>
        timestamp: string
    } = {
        component,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString(),
    }
    log.error(message, data)
    logToFile(message, data)
}

export const logProgress = (
    message: string,
    progress: number,
    total: number
) => {
    const logMessage = `📊 Progress: ${message} (${progress}/${total})`
    const data: {
        message: string
        progress: number
        total: number
        percentage: number
        timestamp: string
    } = {
        message,
        progress,
        total,
        percentage: Math.round((progress / total) * 100),
        timestamp: new Date().toISOString(),
    }
    log.info(logMessage, data)
    logToFile(logMessage, data)
}
