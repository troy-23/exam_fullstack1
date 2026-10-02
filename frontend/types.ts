export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed';
export type Filter = 'all' | Status;

export interface TaskActionError {
  taskId: number;
  message: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
}

export interface Statistics {
  total: number;
  pending: number;
  completed: number;
}

export interface TaskResponse {
  data: Task[];
  statistics: Statistics;
}
