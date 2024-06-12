import { mock } from 'jest-mock-extended'
import mockStdin from 'mock-stdin'

import { AutonomousAgent } from './autonomous-agent'
import { ChatService } from './chat'

describe('ChatService', () => {
  const agentMock = mock<AutonomousAgent>({
    run: () => Promise.resolve('wat?'),
  })
  let stdin: ReturnType<typeof mockStdin.stdin>

  let chatService: ChatService

  beforeEach(() => {
    chatService = new ChatService(agentMock)
    stdin = mockStdin.stdin()
    jest.spyOn(process.stdout, 'write').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should exit the chat when message is "/exit"', async () => {
    expect(
      Promise.all([
        chatService.run(),
        new Promise(resolve => {
          setTimeout(() => {
            stdin.send('/exit')
            resolve('Done')
          }, 100)
        }),
      ]),
    ).resolves.not.toThrow()
  })
})
