import { describe, it, expect, beforeEach, vi } from 'vitest'
import { chatWorkflow } from '../chatWorkflow'
import { productRoadmapAgent } from '../../agents/productRoadmapAgent'

// Mock the agent
vi.mock('../../agents/productRoadmapAgent', () => ({
    productRoadmapAgent: {
        stream: vi.fn(), // Changed from streamVNext to stream to match workflow usage
    },
}))

describe('chatWorkflow', () => {
    beforeEach(() => {
        // Clear all mocks between tests
        vi.clearAllMocks()

        // Setup default mock implementation for streaming
        ;(productRoadmapAgent.stream as any).mockResolvedValue({
            textStream: (async function* () {
                yield 'Test'
                yield ' streaming'
                yield ' response'
            })(),
            text: Promise.resolve('Test streaming response'),
        })
    })

    it('should execute workflow with valid input data and return response', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Already correct, no change needed
            inputData: {
                prompt: 'Hello, how are you?',
                temperature: 0.7,
                maxTokens: 150,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        if (result?.status === 'success') {
            const output = (result as any).result
            expect(output.content).toBeDefined()
            expect(typeof output.content).toBe('string')
        }
    })

    it('should handle prompt without temperature', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'What is TypeScript?',
                maxTokens: 200,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        // Verify the agent was called (temperature will be undefined since not provided)
        expect(productRoadmapAgent.stream).toHaveBeenCalled() // Changed from streamVNext to stream
    })

    it('should handle prompt without maxTokens', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'Explain React hooks',
                temperature: 0.5,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        // Verify the agent was called (maxTokens will be undefined since not provided)
        expect(productRoadmapAgent.stream).toHaveBeenCalled() // Changed from streamVNext to stream
    })

    it('should handle custom temperature and maxTokens', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'Write a poem about code',
                temperature: 0.9,
                maxTokens: 300,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        // Verify the agent was called with custom settings
        expect(productRoadmapAgent.stream).toHaveBeenCalledWith(
            // Changed from streamVNext to stream
            expect.any(Array),
            expect.objectContaining({
                modelSettings: expect.objectContaining({
                    temperature: 0.9,
                    maxOutputTokens: 300,
                }),
            })
        )
    })

    it('should handle streaming with memory context', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'Continue our conversation',
                temperature: 0.7,
                maxTokens: 200,
                resourceId: 'user-123',
                threadId: 'thread-456',
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        // Verify the agent was called with memory configuration
        expect(productRoadmapAgent.stream).toHaveBeenCalledWith(
            // Changed from streamVNext to stream
            expect.any(Array),
            expect.objectContaining({
                memory: {
                    resource: 'user-123',
                    thread: 'thread-456',
                },
            })
        )
    })

    it('should include systemPrompt when provided', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'Explain async/await',
                systemPrompt: 'You are a technical expert',
                temperature: 0.7,
                maxTokens: 200,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        // Verify the agent was called with instructions
        expect(productRoadmapAgent.stream).toHaveBeenCalledWith(
            // Changed from streamVNext to stream
            expect.any(Array),
            expect.objectContaining({
                instructions: 'You are a technical expert',
            })
        )
    })

    it('should handle prompt with conversation context', async () => {
        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'Follow up: Can you explain that in more detail?',
                temperature: 0.7,
                maxTokens: 150,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        expect(result).toBeDefined()
        expect(result?.status).toBe('success')

        // Verify the agent was called
        expect(productRoadmapAgent.stream).toHaveBeenCalled() // Changed from streamVNext to stream
    })

    it('should handle agent errors gracefully', async () => {
        ;(productRoadmapAgent.stream as any).mockRejectedValue(
            new Error('Streaming Error')
        ) // Changed from streamVNext to stream

        const run = await chatWorkflow.createRunAsync()

        const stream = run.stream({
            // Changed from streamVNext to stream
            inputData: {
                prompt: 'This will fail',
                temperature: 0.7,
                maxTokens: 150,
                currentDate: ''
            },
        })

        const result = await stream.getWorkflowState()

        // Workflow should handle error appropriately
        expect(result).toBeDefined()
    })
})
