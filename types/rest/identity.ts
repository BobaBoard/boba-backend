export interface Role {
  id: string;
  name: string;
  color?: string;
  accessory?: string;
  avatar_url: string;
}

export interface Accessory {
  id: string;
  name: string;
  accessory: string;
}

export interface Identity {
  name: string;
  avatar: string;
}

export interface SecretIdentity {
  name: string;
  avatar: string;
  color?: string | null;
  accessory?: string | null;
}
