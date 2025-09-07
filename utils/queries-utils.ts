import stringify from "fast-json-stable-stringify";
import { z } from "zod";

const CursorSchema = z.object({
  last_activity_cursor: z.string(),
  page_size: z.number(),
});

export const encodeCursor = (cursor: {
  last_activity_cursor: string;
  page_size: number;
}) => {
  return Buffer.from(stringify(cursor)).toString("base64");
};

export const decodeCursor = (
  cursor: string
): {
  last_activity_cursor: string;
  page_size: number;
} => {
  const parsed = JSON.parse(Buffer.from(cursor, "base64").toString());
  return CursorSchema.parse(parsed);
};
