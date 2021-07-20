export const encodeCursor = (cursor: {
  last_activity_cursor: string;
  page_size: number;
}) => {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
};

export const decodeCursor = (
  cursor: string
): {
  last_activity_cursor: string;
  page_size: number;
} => {
  return JSON.parse(Buffer.from(cursor, "base64").toString()) as any;
};
