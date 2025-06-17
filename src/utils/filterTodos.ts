import { Todo } from '../types/Todo';

export enum FilterType {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

export const getActiveTodos = (todos: Todo[]) =>
  todos.filter(todo => !todo.completed);

export const getCompletedTodos = (todos: Todo[]) =>
  todos.filter(todo => todo.completed);

export const filterTodos = (todos: Todo[], filter: string) =>
  todos.filter(todo => {
    return filter === 'all'
      ? true
      : filter === 'active'
        ? !todo.completed
        : todo.completed;
  });
