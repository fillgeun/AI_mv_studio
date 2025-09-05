
export interface Service {
  name: string;
  url: string | null;
  description: string;
  icon: string;
  isApiBased?: boolean;
}

export interface TabDef {
  id: string;
  name: string;
  icon: string;
  services: Service[];
}

export interface WorkflowStep {
  id: number;
  name: string;
  tabId: string;
}
