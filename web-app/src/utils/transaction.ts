export function getMessageName(messageType: string) {
  const matched = messageType.match(/[^.]+$/);

  return matched ? matched[0] : '';
}
