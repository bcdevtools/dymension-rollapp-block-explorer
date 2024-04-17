export function getMessageName(messageType: string) {
  const matched = messageType.match(/[^.]+$/);

  return matched ? matched[0] : '';
}

export const ctsRegex = /{\[{\s.\[address].\[([a-z\d]+)].\s}]}/g;

export const translateCts = (
  ctm: string,
  convertAddressToLink: (address: string) => React.ReactNode
): React.ReactNode[] => {
  const splitted = ctm.split(ctsRegex);

  if (splitted.length === 1) return [ctm];
  if (splitted[0] === '') splitted.shift();

  return splitted.map((part, idx) => {
    if (idx % 2 === 1) return part;
    return convertAddressToLink(part);
  });
};
