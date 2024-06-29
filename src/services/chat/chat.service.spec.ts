import { mock } from 'jest-mock-extended'
import mockStdin from 'mock-stdin'

import { AutonomousAgent } from './autonomous-agent'
import { ChatService } from './chat.service'

describe('ChatService', () => {
  const agentMock = mock<AutonomousAgent>({
    run: () => Promise.resolve('wat?'),
  })
  let stdin: ReturnType<typeof mockStdin.stdin>

  let chatService: ChatService

  beforeEach(() => {
    chatService = new ChatService(agentMock)
    stdin = mockStdin.stdin()
    import.meta.jest.spyOn(process.stdout, 'write').mockImplementation()
    import.meta.jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    import.meta.jest.clearAllMocks()
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
