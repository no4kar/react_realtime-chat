import { BASE_URL } from '../utils/helpers';
import { getClient } from '../utils/axiosClient';
import { Room } from 'types/Room.type';

const client = getClient(`${BASE_URL}/rooms`);

export const getAll = (
) => {
  return client.get<Room[]>('');
};

export const create = ({
  name,
}: Omit<Room, 'id'>) => {
  return client.post<Room>('', { name });
};

export const remove = ({
  id,
}: Omit<Room, 'name'>) => {
  return client.delete<number>(`/${id}`);
};
