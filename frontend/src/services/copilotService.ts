import { api } from "@/services/api";
import { getOrEmpty, unwrap } from "@/services/http";
import type { Conversation, ConversationMessage, CopilotContext } from "@/types/domain";

export interface CopilotAskRequest {
  question: string;
  context: CopilotContext;
}

export interface CopilotService {
  getConversation(): Promise<Conversation>;
  buildContext(): Promise<CopilotContext>;
  ask(request: CopilotAskRequest): Promise<ConversationMessage>;
  streamAnswer(request: CopilotAskRequest, onToken: (token: string) => void): Promise<ConversationMessage>;
}

const emptyContext: CopilotContext = {
  invoices: [],
  vendors: [],
  cases: [],
  actions: [],
  approvals: [],
  graphSummary: "",
  riskSummary: "",
};

export const copilotService: CopilotService = {
  async getConversation() {
    return getOrEmpty<Conversation>("/ai/conversation", {
      id: "",
      userId: "",
      messages: [],
    });
  },

  async buildContext() {
    return getOrEmpty<CopilotContext>("/ai/context", emptyContext);
  },

  async ask(request) {
    const response = await api.post<ConversationMessage | { data: ConversationMessage } | { message: ConversationMessage }>("/ai/chat", {
      question: request.question,
      context: request.context,
    });

    if ("message" in response.data) {
      return response.data.message;
    }

    return unwrap(response.data);
  },

  async streamAnswer(request, onToken) {
    const message = await this.ask(request);
    onToken(message.content);
    return message;
  },
};
