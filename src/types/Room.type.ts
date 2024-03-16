export type Room = {
  id: string,
  name: string,
};

export enum RoomAction {
  CREATE = 'CREATE_ROOM',
  DELETE = 'DELETE_ROOM',
  RENAME = 'RENAME_ROOM',
  UPDATE = 'UPDATE_ROOMS',
  ENTER = 'ENTER_THE_ROOM',
  LEAVE = 'LEAVE_THE_ROOM',
};
