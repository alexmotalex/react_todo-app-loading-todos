import { Todo } from '../types/Todo';
import { getActiveTodos, getCompletedTodos, filterTodos } from './filterTodos';

export const getTodoStats = (todos: Todo[], filter: string) => {
  const activeTodos = getActiveTodos(todos);
  const completedTodos = getCompletedTodos(todos);
  const visibleTodos = filterTodos(todos, filter);

  return {
    activeTodos,
    completedTodos,
    visibleTodos,
    activeCount: activeTodos.length,
    completedCount: completedTodos.length,
  };
};
