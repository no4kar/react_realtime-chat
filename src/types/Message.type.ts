export type Message = {
  text: string,
  author: string,
  createdAt: string,
};

export type MessageSend = {
  text: string,
  author: string,
  roomId: string,
};

export enum MessageAction {
  CREATE = 'CREATE_MESSAGE',
};
