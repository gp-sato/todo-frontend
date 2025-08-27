import React from 'react';
import TaskItem from './TaskItem';

type Task = {
  id: number;
  title: string;
  is_completed: boolean;
  due_date: string | null;
};

type TaskListProps = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function TaskList({ tasks, setTasks, setErrorMessages }: TaskListProps) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          setTasks={setTasks}
          setErrorMessages={setErrorMessages}
        />
      ))}
    </ul>
  );
};
