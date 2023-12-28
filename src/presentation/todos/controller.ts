import { Request, Response } from "express";
import { prisma } from "../../data/postgres";
import { CreateTodoDto, UpdateTodoDto } from "../../domain/dtos";

export class TodosController {
  //* DI ( Dependency Injection )
  constructor() {}

  public getTodos = async (req: Request, res: Response) => {
    const todos = await prisma.todo.findMany({});
    return res.status(200).json(todos);
  };

  public getTodoById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const todo = await prisma.todo.findFirst({ where: { id } });
    todo
      ? res.status(200).json(todo)
      : res.status(404).json({ error: "Todo not found" });
  };

  public createTodo = async (req: Request, res: Response) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body);
    if (error) return res.status(400).json({ error });

    const todo = await prisma.todo.create({ data: createTodoDto! });

    return res.status(200).json(todo);
  };

  public updateTodo = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    const [error, updateTodoDto] = UpdateTodoDto.create({...req.body, id});
    if (error) return res.status(400).json({ error });
    
    const todo = await prisma.todo.findFirst({ where: { id } });

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updateTodoDto!.values,
    });

    return res.status(200).json(updatedTodo);
  };

  public deleteTodo = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const todo = await prisma.todo.findFirst({ where: { id } });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    const deleted = await prisma.todo.delete({ where: { id } });
    deleted
      ? res.status(200).json({ deleted })
      : res.status(404).json({ error: "Todo not found" });
  };
}
