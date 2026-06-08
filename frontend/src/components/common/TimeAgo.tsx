import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface Props {
  date: string | Date;
}

export default function TimeAgo({ date }: Props) {
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });
  return <span title={new Date(date).toLocaleString()}>{timeAgo}</span>;
}
