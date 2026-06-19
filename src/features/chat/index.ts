/** Public surface of the chat feature (server side).
 *  UI components (ChatWidget, etc.) are imported directly from their files. */
export { sendChatMessage } from './server/chat.actions';
export type { ChatResult, ChatTurn, ChatProductCardData } from './chat.types';
