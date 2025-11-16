export interface DownlineMember {
  id: string;
  name: string;
  startingCapital: number;
  level: number;
  downlines?: DownlineMember[];
}

export interface MLMData {
  me: {
    name: string;
    startingCapital: number;
  };
  firstLevel: DownlineMember[];
  secondLevel: Record<string, DownlineMember[]>;
  thirdLevel: Record<string, DownlineMember[]>;
}

