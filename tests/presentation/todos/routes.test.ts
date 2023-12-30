import request from "supertest";
import { testServer } from "../../test-server";
import { prisma } from "../../../src/data/postgres";

describe("Todo route testing", () => {
  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(() => {
    testServer.close();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  const todo1 = { text: "Hola Mundo 1" };
  const todo2 = { text: "Hola Mundo 2" };

  test("should return TODOs api/todos ", async () => {
    await prisma.todo.createMany({
      data: [todo1, todo2],
    });

    const { body } = await request(testServer.app)
      .get("/api/todos")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBe(2);
    expect(body[0].text).toBe(todo1.text);
    expect(body[1].text).toBe(todo2.text);
    expect(body[0].completedAt).toBeNull();
    expect(body[1].completedAt).toBeNull();
  });

  test("should return TODOs api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .get(`/api/todos/${todo.id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body).toEqual(todo);
    expect(body).toBeInstanceOf(Object);
    expect(body.text).toBe(todo1.text);
    expect(body.completedAt).toBeNull();
  });

  test("should return a 404 error when TODO is not found", async () => {
    const todoId = 1000;
    const { body } = await request(testServer.app)
      .get(`/api/todos/${todoId}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.error).toBe(`Todo with id ${todoId} not found`);
  });

  test("should create a TODO api/todos", async () => {
    const { body } = await request(testServer.app)
      .post("/api/todos")
      .send(todo1)
      .expect(201)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.text).toBe(todo1.text);
    expect(body.completedAt).toBeNull();
  });

  test("should return a 400 error when TODO (text) is not valid api/todos", async () => {
    const { body } = await request(testServer.app)
      .post("/api/todos")
      .send({})
      .expect(500)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.error).toBe("Text property is required");
  });

  test("should return a 400 error when TODO (text) is empty api/todos", async () => {
    const { body } = await request(testServer.app)
      .post("/api/todos")
      .send({ text: "" })
      .expect(500)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.error).toBe("Text property is required");
  });

  test("should update a TODO api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });
    const todoUpdate = {
      text: "Hola Mundo 1 Update",
      completedAt: "2023-12-28",
    };

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send(todoUpdate)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.text).toBe(todoUpdate.text);
    expect(body.completedAt).toBe(todoUpdate.completedAt + "T00:00:00.000Z");
  });

  test("should return an updated TODO only with the date api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });
    const todoUpdate = { completedAt: "2023-12-28" };

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send(todoUpdate)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.text).toBe(todo.text);
    expect(body.completedAt).toBe(todoUpdate.completedAt + "T00:00:00.000Z");
  });

  test("should return an updated TODO only with the text api/todos/:id", async () => {
    const todo = await prisma.todo.create({
      data: { text: "Hola", completedAt: new Date() },
    });
    const todoUpdate = { text: "Hola Mundo 1 Update" };

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send(todoUpdate)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.text).toBe(todoUpdate.text);
    expect(body.completedAt).not.toBeNull();
    expect(body.completedAt).toBe(todo.completedAt?.toISOString());
  });

  // TODO: realizar la operación con errores personalizados
  test("should return 404 if TODO is not found api/todos/:id", async () => {
    const todoId = 1000;
    const { body } = await request(testServer.app)
      .put(`/api/todos/${todoId}`)
      .send(todo1)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.error).toBe(`Todo with id ${todoId} not found`);
  });

  test("should delete a TODO api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .delete(`/api/todos/${todo.id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body).toEqual(todo);
  });
  
  // TODO: cambiar a 404
  test("should return 404 if TODO is not found api/todos/:id", async () => {
    const todoId = 1000;
    const { body } = await request(testServer.app)
      .delete(`/api/todos/${todoId}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(body).toBeInstanceOf(Object);
    expect(body.error).toBe(`Todo with id ${todoId} not found`);
  });
});
