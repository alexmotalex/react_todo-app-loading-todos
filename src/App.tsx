/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import cn from 'classnames';
import { Todo } from './types/Todo';
import * as todoService from './api/todos';
import { FilterType } from './utils/filterTodos';
import { getTodoStats } from './utils/todoStats';

enum ErrorMessage {
  Load = 'Unable to load todos',
  EmptyTitle = 'Title should not be empty',
  Add = 'Unable to add a todo',
  Delete = 'Unable to delete a todo',
  Update = 'Unable to update a todo',
}

const ERROR_DISPLAY_TIMEOUT = 3000;

export const App: React.FC = () => {
  const [todoInput, setTodoInput] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>(FilterType.All);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    todoService
      .getTodos()
      .then(data => {
        setTodos(data);
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.Load);

        throw error;
      })
      .finally(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setErrorMessage('');
    }, ERROR_DISPLAY_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  const { completedTodos, visibleTodos, activeCount, completedCount } =
    getTodoStats(todos, filter);

  const addTodo = ({ title, userId, completed }: Omit<Todo, 'id'>) => {
    setLoading(true);

    todoService
      .addTodo({ title, userId, completed })
      .then(newTodo => {
        setTodos(current => [...current, newTodo]);
        setTodoInput('');
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.Add);
        throw error;
      })
      .finally(() => {
        setLoading(false);

        setTimeout(() => inputRef.current?.focus(), 0);
      });
  };

  // const deleteTodo = (todoId: number) => {
  //   todoService
  //     .deleteTodo(todoId)
  //     .then(() =>
  //       setTodos(current => current.filter(todo => todo.id !== todoId)),
  //     )
  //     .catch(error => {
  //       setErrorMessage(ErrorMessage.Delete);
  //       throw error;
  //     });
  // };

  const deleteCompletedTodo = () => {
    const deleteRequests = completedTodos.map(todo =>
      todoService.deleteTodo(todo.id),
    );

    setLoading(true);

    Promise.allSettled(deleteRequests)
      .then(() => setTodos(current => current.filter(todo => !todo.completed)))
      .catch(error => {
        setErrorMessage(ErrorMessage.Delete);
        throw error;
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const prepearedInputValue = todoInput.trim();

    if (!prepearedInputValue) {
      setErrorMessage(ErrorMessage.EmptyTitle);

      return;
    }

    addTodo({
      title: prepearedInputValue,
      userId: todoService.USER_ID,
      completed: false,
    });
  };

  return (
    <div className={cn('todoapp', { 'has-error': errorMessage })}>
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              ref={inputRef}
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={todoInput}
              onChange={e => setTodoInput(e.target.value)}
              disabled={loading}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => {
            const { completed, id, title } = todo;

            return (
              <div
                key={id}
                data-cy="Todo"
                className={cn('todo', { completed })}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={completed}
                    onChange={() => {}}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {title}
                </span>

                {/* Remove button appears only on hover */}
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                  // onClick={() => deleteTodo(id)}
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {activeCount} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={cn('filter__link', {
                  selected: filter === FilterType.All,
                })}
                data-cy="FilterLinkAll"
                onClick={() => setFilter(FilterType.All)}
              >
                All
              </a>

              <a
                href="#/active"
                className={cn('filter__link', {
                  selected: filter === FilterType.Active,
                })}
                data-cy="FilterLinkActive"
                onClick={() => setFilter(FilterType.Active)}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={cn('filter__link', {
                  selected: filter === FilterType.Completed,
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter(FilterType.Completed)}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={deleteCompletedTodo}
              disabled={completedCount === 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>
      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification',
          'is-danger',
          'is-light',
          'has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
};
