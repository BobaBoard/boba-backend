import { z } from "zod";

// Currently only used by zodthreads.ts

export const Role= z.object({
    id: z.string(),
    name: z.string(),
    color: z.string().optional(),
    accessory: z.string().optional().nullable(),
    avatar_url: z.string(),
  });
  
  export const Accessory= z.object({
    id: z.string(),
    name: z.string(),
    accessory: z.string(),
  });
  
  export const Identity= z.object({
    name: z.string(),
    avatar: z.string(),
  });
  
  export const SecretIdentity= z.object({
    name: z.string(),
    avatar: z.string(),
    color: z.string().optional().nullable(),
    accessory: z.string().optional().nullable(),
  });
  