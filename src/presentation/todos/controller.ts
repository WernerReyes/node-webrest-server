import { Request, Response } from "express";

import { CreateTodoDto, UpdateTodoDto } from "../../domain/dtos";
import { TodoRepository } from "../../domain/repositories/todo.repository";
import {
  CreateTodo,
  CustomError,
  DeleteTodo,
  GetTodo,
  GetTodos,
  UpdateTodo,
} from "../../domain";

export class TodosController {
  //* DI ( Dependency Injection )
  constructor(private readonly todoRepository: TodoRepository) {}

  private handleError = (res: Response, error:unknown) => {
    if(error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    return res.status(500).json({ error })
  }

  public getTodos = (req: Request, res: Response) => {
    new GetTodos(this.todoRepository)
      .execute()
      .then((todos) => res.json(todos))
      .catch((error) => this.handleError(res, error));
  };

  public getTodoById = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    new GetTodo(this.todoRepository)
      .execute(id)
      .then((todo) => res.json(todo))
      .catch((error) => this.handleError(res, error));
  };

  public createTodo = (req: Request, res: Response) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body);
    if (error) return this.handleError(res, error);
    new CreateTodo(this.todoRepository)
      .execute(createTodoDto!)
      .then((todo) => res.status(201).json(todo))
      .catch((error) => this.handleError(res, error));
  };

  public updateTodo = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [error, updateTodoDto] = UpdateTodoDto.create({ ...req.body, id });
    if (error) return this.handleError(res, error);
    new UpdateTodo(this.todoRepository)
      .execute(updateTodoDto!)
      .then((todo) => res.json(todo))
      .catch((error) => this.handleError(res, error));
  };

  public deleteTodo = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    new DeleteTodo(this.todoRepository)
      .execute(id)
      .then((todo) => res.json(todo))
      .catch((error) => this.handleError(res, error));
  };
}
