import * as R from 'react';

import { MessageAction, type Message } from "../../types/Message.type";
import { AppContext } from 'store/AppContext';
import { BASE_URL } from 'utils/helpers';
import * as messageApi from 'api/message.api';
import * as roomApi from 'api/room.api';
import { Dropdown } from 'components/Dropdown/Dropdown';
import { Room, RoomAction } from 'types/Room.type';

type Props = {
  onData: R.Dispatch<R.SetStateAction<Message[]>>;
};

export const DataLoader: R.FC<Props> = ({
  onData = () => { },
}) => {
  const { room, setRoom, setSocket } = R.useContext(AppContext);
  const [isProcessing, setIsProcessing] = R.useState(false);
  const [rooms, setRooms] = R.useState<Room[]>([]);

  R.useEffect(() => {
    setIsProcessing(true);

    const fetchRooms = roomApi.getAll()
      .then(setRooms);

    if (!room) {
      fetchRooms
        .finally(() => setIsProcessing(false));
      return;
    }

    const socket = new WebSocket(BASE_URL.replace(/http:|https:/g, 'ws:'));
    const fetchMessages = messageApi.getAll(room.id)
      .then(onData)
      .catch(() => {
        onData([]);
        socket.close();
      });

    Promise.all([fetchMessages, fetchRooms])
      .finally(() => setIsProcessing(false));

    socket.onopen = () => {
      console.info(`socket.onopen`);
      socket.send(JSON.stringify(
        {
          action: RoomAction.ENTER,
          payload: {
            roomId: room.id,
          },
        }));
    };

    socket.onmessage = (event: MessageEvent<any>) => {
      const { action, payload } = JSON.parse(event.data);

      console.dir(action);
      console.dir(payload);

      switch (action) {
        case MessageAction.CREATE: {
          const { text, author, createdAt, roomId } = payload;

          if (!roomId
            || !text
            || !author
            || !createdAt) {
            throw new Error(`${MessageAction.CREATE} -> Spoiled message`);
          }

          if (roomId === room.id) {
            onData(prev => [{ text, author, createdAt }, ...prev]);
          }

          return;
        }

        case RoomAction.UPDATE: {
          const rooms: Room[] = Array.from(payload);

          if (!Array.isArray(rooms)) {
            throw new Error(`${RoomAction.UPDATE} -> Spoiled message`);
          }

          setRooms(rooms);
          return;
        }

        default:
          throw new Error('Unprocessed message');
      }
    };

    socket.onclose = () => {
      console.info(`socket.onclose`);
      setSocket(null);
    };

    setSocket(socket);

    return () => {
      console.info(`socket.close();`);
      socket.close();
    }
  }, [room]);

  const handleRoomRemove = R.useCallback(async (itemId: Room['id']) => {
    // if (room.id === itemId) {
    //   setRoom(null);
    // }
    
    setIsProcessing(true);

    await roomApi.remove({ id: itemId });

    await roomApi.getAll()
      .then((data: Room[]) => {
        setRooms(data);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [room]);

  const handleRoomCreate = R.useCallback(async ({ name }: { name: Room['name'] }) => {
    setIsProcessing(true);

    await roomApi.create({ name })
      .then(setRoom);

    await roomApi.getAll()
      .then(setRooms)
      .finally(() => {
        setIsProcessing(false);
      });
  }, []);

  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">Chat room</label>
      </div>

      <div className="field-body">
        <div className="field">
          <Dropdown
            items={rooms}
            selectedItem={room}
            isProcessing={isProcessing}
            onSelectItem={(itemId) => { setRoom(rooms.find(r => r.id === itemId)) }}
            onCreateItem={handleRoomCreate}
            onRemoveItem={handleRoomRemove}
          />
        </div>
      </div>
    </div>
  );
};