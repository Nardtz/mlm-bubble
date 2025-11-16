export interface DownlineMember {
  id: string;
  name: string;
  startingCapital: number;
  level: number;
  downlines?: DownlineMember[];
}

export interface MLMData {
  me: {
    id?: string; // ME member ID (e.g., "me-{userId}")
    name: string;
    startingCapital: number;
  };
  firstLevel: DownlineMember[];
  secondLevel: Record<string, DownlineMember[]>;
  thirdLevel: Record<string, DownlineMember[]>;
}

