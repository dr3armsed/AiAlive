export interface RuntimeEgregore {
  id: string;
  name: string;
  persona: string;
  sourceMaterial: string;
  createdAt: string;
}

export interface RuntimePrivateWorld {
  id: string;
  egregoreId: string;
  roomCount: number;
  dominantTheme: string;
  summary: string;
  createdAt: string;
}

export interface RuntimeCreativeWork {
  id: string;
  title: string;
  type: string;
  content: string;
  authorId: string;
  createdAt: string;
}
